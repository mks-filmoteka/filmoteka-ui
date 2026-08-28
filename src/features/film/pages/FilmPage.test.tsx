import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Film} from "../types/film";
import FilmPage from "./FilmPage";

type MutationOptions<TData = unknown> = {
    onSuccess?: (data: TData) => void;
    onSettled?: () => void;
};

type FilmDetailsMockProps = {
    data: {id: number; title: string};
};

const mocks = vi.hoisted(() => ({
    useFilm: vi.fn(),
    useDeleteFilm: vi.fn(),
    deleteFilmMutate: vi.fn(),
    useDeleteFile: vi.fn(),
    deleteFileMutate: vi.fn(),
    navigate: vi.fn(),
    authenticated: true,
}));

vi.mock("../queries/useFilm.ts", () => ({
    useFilm: mocks.useFilm,
}));

vi.mock("../queries/useDeleteFilm.ts", () => ({
    useDeleteFilm: mocks.useDeleteFilm,
}));

vi.mock("../../media/queries/useDeleteFile.ts", () => ({
    useDeleteFile: mocks.useDeleteFile,
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
    const FilmDetails = ({data}: FilmDetailsMockProps) => (
        <div>
            <span>{data.title}</span>
        </div>
    );

    return {FilmDetails};
});

vi.mock("../../collection/components/CollectionsPopup.tsx", () => ({
    CollectionsPopup: ({
        filmId,
        onClose,
    }: {
        filmId: number;
        onClose: () => void;
    }) => (
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
    actors: [{id: 1, name: "Test Actor"}],
    directors: [{id: 2, name: "Test Director"}],
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
    mocks.authenticated = true;

    mocks.useFilm.mockReturnValue({
        data: film,
        isLoading: false,
        error: null,
    });
    mocks.useDeleteFilm.mockReturnValue({
        mutate: mocks.deleteFilmMutate,
    });
    mocks.useDeleteFile.mockReturnValue({
        mutate: mocks.deleteFileMutate,
    });
    mocks.deleteFilmMutate.mockImplementation(
        (_id: number, options?: MutationOptions) => {
            options?.onSuccess?.({});
        }
    );
    mocks.deleteFileMutate.mockImplementation(
        (_fileName: string, options?: MutationOptions) => {
            options?.onSettled?.();
        }
    );
});

describe("FilmPage", () => {
    it("opens collections popup for the current film", () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Collections"));

        expect(screen.getByRole("dialog", {name: "Collections"})).toHaveTextContent("film 1");

        fireEvent.click(screen.getByText("close collections"));

        expect(screen.queryByRole("dialog", {name: "Collections"})).not.toBeInTheDocument();
    });

    it("navigates to the film edit page", () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Edit"));

        expect(mocks.navigate).toHaveBeenCalledWith("/films/1/edit");
    });

    it("navigates back to the film list after deleted film poster cleanup settles", async () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Delete"));

        await waitFor(() => {
            expect(mocks.deleteFilmMutate).toHaveBeenCalledWith(1, expect.any(Object));
            expect(mocks.deleteFileMutate).toHaveBeenCalledWith("old.jpg", expect.any(Object));
            expect(mocks.navigate).toHaveBeenCalledWith("/films");
        });
    });
});
