import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Film } from "../types/film";
import FilmPage from "./FilmPage";

type MutationOptions = {
    onSuccess?: () => void;
};

type FilmDetailsMockProps = {
    data: { id: number; title: string };
};

const mocks = vi.hoisted(() => ({
    useFilm: vi.fn(),
    useDeleteFilm: vi.fn(),
    deleteFilmMutate: vi.fn(),
    navigate: vi.fn(),
    authenticated: true,
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

const film: Film = {
    id: 1,
    title: "Test Title",
    releaseYear: 2000,
    countries: ["Poland"],
    description: "Test description",
    posterName: "old.jpg",
    genres: ["Drama"],
    actors: [{ id: 1, name: "Test Actor" }],
    directors: [{ id: 2, name: "Test Director" }],
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal(
        "confirm",
        vi.fn(() => true),
    );
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

    it("navigates back to the film list only after deletion succeeds", () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Delete"));

        expect(mocks.deleteFilmMutate).toHaveBeenCalledWith(1, expect.any(Object));
        expect(mocks.navigate).not.toHaveBeenCalled();

        const options = mocks.deleteFilmMutate.mock.calls[0][1] as MutationOptions;
        options.onSuccess?.();

        expect(mocks.navigate).toHaveBeenCalledWith("/films");
    });

    it("does not delete when confirmation is cancelled", () => {
        vi.mocked(globalThis.confirm).mockReturnValue(false);
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

    it("shows the API error and stays on the film page when deletion fails", () => {
        const { rerender } = render(<FilmPage />);
        fireEvent.click(screen.getByTitle("Delete"));

        mocks.useDeleteFilm.mockReturnValue({
            mutate: mocks.deleteFilmMutate,
            isPending: false,
            error: Object.assign(new Error("Request failed"), {
                response: { data: { message: "Catalog unavailable" } },
            }),
        });
        rerender(<FilmPage />);

        expect(screen.getByRole("alert")).toHaveTextContent("Could not delete film: Catalog unavailable");
        expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
        expect(mocks.navigate).not.toHaveBeenCalled();
    });
});
