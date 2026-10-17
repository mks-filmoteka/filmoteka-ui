import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FilmPage from "./FilmPage";
import type { MutationOptions } from "../../../test/mutationOptions";
import { testFilm, testApiError } from "../../../test/testData";

type FilmDetailsMockProps = {
    data: { id: number; title: string };
};

const mocks = vi.hoisted(() => ({
    toast: vi.fn(),
    confirm: vi.fn(),
    useFilm: vi.fn(),
    useDeleteFilm: vi.fn(),
    deleteFilmMutate: vi.fn(),
    navigate: vi.fn(),
    authenticated: true,
}));

vi.mock("../../../shared/utils/useToast.ts", () => ({
    useToast: () => mocks.toast,
}));

vi.mock("../../../shared/utils/useConfirm.ts", () => ({
    useConfirm: () => mocks.confirm,
}));

vi.mock("../queries/useFilm.ts", () => ({
    useFilm: mocks.useFilm,
}));

vi.mock("../queries/useDeleteFilm.ts", () => ({
    useDeleteFilm: mocks.useDeleteFilm,
}));

vi.mock("../../../auth/useAuth.ts", () => ({
    useAuth: () => ({
        authenticated: mocks.authenticated,
        isAdmin: true,
    }),
}));

vi.mock("../../../shared/utils/useRequiredId.ts", () => ({
    useRequiredId: () => 1,
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<typeof import("react-router")>("react-router");

    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

vi.mock("../components/FilmDetails.tsx", () => {
    const FilmDetails = ({ data }: FilmDetailsMockProps) => (
        <div>
            <span>{data.title}</span>
        </div>
    );

    return { FilmDetails };
});

vi.mock("../../collection/components/CollectionsPopup.tsx", () => ({
    CollectionsPopup: ({ filmId, onClose }: { filmId: number; onClose: () => void }) => (
        <div role="dialog" aria-label="Collections">
            <span>film {filmId}</span>
            <button onClick={onClose}>close collections</button>
        </div>
    ),
}));

const film = testFilm({ posterName: "old.jpg" });

beforeEach(() => {
    vi.resetAllMocks();
    mocks.confirm.mockResolvedValue(true);
    mocks.authenticated = true;

    mocks.useFilm.mockReturnValue({
        data: film,
        isLoading: false,
        error: null,
    });
    mocks.useDeleteFilm.mockReturnValue({
        mutate: mocks.deleteFilmMutate,
        isPending: false,
        error: null,
    });
});

describe("FilmPage", () => {
    it("opens collections popup for the current film", () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Collections"));

        expect(screen.getByRole("dialog", { name: "Collections" })).toHaveTextContent("film 1");

        fireEvent.click(screen.getByText("close collections"));

        expect(screen.queryByRole("dialog", { name: "Collections" })).not.toBeInTheDocument();
    });

    it("navigates to the film edit page", () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Edit"));

        expect(mocks.navigate).toHaveBeenCalledWith("/films/1/edit");
    });

    it("navigates back to the film list only after deletion succeeds", async () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Delete"));
        await waitFor(() => expect(mocks.deleteFilmMutate).toHaveBeenCalled());

        expect(mocks.deleteFilmMutate).toHaveBeenCalledWith(1, expect.any(Object));
        expect(mocks.navigate).not.toHaveBeenCalled();

        const options = mocks.deleteFilmMutate.mock.calls[0][1] as MutationOptions;
        options.onSuccess?.();

        expect(mocks.navigate).toHaveBeenCalledWith("/films");
        expect(mocks.toast).toHaveBeenCalledWith("Film deleted");
    });

    it("does not delete when confirmation is cancelled", () => {
        mocks.confirm.mockResolvedValue(false);
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Delete"));

        expect(mocks.deleteFilmMutate).not.toHaveBeenCalled();
        expect(mocks.navigate).not.toHaveBeenCalled();
    });

    it("disables deletion while a request is pending", () => {
        mocks.useDeleteFilm.mockReturnValue({ mutate: mocks.deleteFilmMutate, isPending: true, error: null });
        render(<FilmPage />);

        const button = screen.getByRole("button", { name: "Delete" });
        expect(button).toBeDisabled();
        fireEvent.click(button);

        expect(mocks.deleteFilmMutate).not.toHaveBeenCalled();
    });

    it("shows the not-found page when the film does not exist", () => {
        mocks.useFilm.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: testApiError({ status: 404 }),
        });

        render(
            <MemoryRouter>
                <FilmPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    });

    it("shows the API error and stays on the film page when deletion fails", () => {
        const { rerender } = render(<FilmPage />);
        fireEvent.click(screen.getByTitle("Delete"));

        mocks.useDeleteFilm.mockReturnValue({
            mutate: mocks.deleteFilmMutate,
            isPending: false,
            error: testApiError({ message: "Catalog unavailable" }),
        });
        rerender(<FilmPage />);

        expect(screen.getByRole("alert")).toHaveTextContent("Could not delete film: Catalog unavailable");
        expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
        expect(mocks.navigate).not.toHaveBeenCalled();
    });
});
