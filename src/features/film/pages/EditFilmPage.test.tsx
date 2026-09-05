import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilmFormSaveOptions } from "../components/FilmForm.tsx";
import type { Film } from "../types/film.ts";
import type { FilmRequest } from "../types/filmRequest.ts";
import { fillForm } from "../utils/formState.ts";
import EditFilmPage from "./EditFilmPage.tsx";

type FilmFormProps = {
    initialFilm?: Film;
    confirmMessage: string;
    isPending?: boolean;
    isChanged: (form: FilmRequest, posterFile: File | null) => boolean;
    onCancel: () => void;
    onSave: (request: FilmRequest, options: FilmFormSaveOptions) => void;
};

type MutationOptions<TData = unknown> = {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    useRequiredId: vi.fn(),
    useFilm: vi.fn(),
    useUpdateFilm: vi.fn(),
    updateFilmMutate: vi.fn(),
    useDeleteFile: vi.fn(),
    deleteFileMutate: vi.fn(),
    filmForm: vi.fn(),
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<typeof import("react-router")>("react-router");

    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

vi.mock("../../../shared/utils/useRequiredId.ts", () => ({
    useRequiredId: mocks.useRequiredId,
}));

vi.mock("../queries/useFilm.ts", () => ({
    useFilm: mocks.useFilm,
}));

vi.mock("../queries/useUpdateFilm.ts", () => ({
    useUpdateFilm: mocks.useUpdateFilm,
}));

vi.mock("../../media/queries/useDeleteFile.ts", () => ({
    useDeleteFile: mocks.useDeleteFile,
}));

vi.mock("../components/FilmForm.tsx", () => ({
    FilmForm: (props: FilmFormProps) => {
        mocks.filmForm(props);
        return <div data-testid="film-form" />;
    },
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

const request: FilmRequest = {
    title: "Updated Title",
    releaseYear: 2000,
    countries: ["Poland"],
    description: "Test description",
    posterName: "new.jpg",
    genres: ["Drama"],
    actors: [{ name: "Test Actor" }],
    directors: [{ name: "Test Director" }],
};

function getFilmFormProps() {
    const props = mocks.filmForm.mock.calls[0]?.[0] as FilmFormProps | undefined;
    if (!props) {
        throw new Error("FilmForm props not found");
    }
    return props;
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRequiredId.mockReturnValue(1);
    mocks.useFilm.mockReturnValue({
        data: film,
        isLoading: false,
        error: null,
    });
    mocks.useUpdateFilm.mockReturnValue({
        mutate: mocks.updateFilmMutate,
        isPending: false,
    });
    mocks.useDeleteFile.mockReturnValue({
        mutate: mocks.deleteFileMutate,
    });
});

describe("EditFilmPage", () => {
    it("renders loading, error, and not found states", () => {
        mocks.useFilm.mockReturnValueOnce({
            data: undefined,
            isLoading: true,
            error: null,
        });
        const { rerender } = render(<EditFilmPage />);

        expect(screen.getByRole("heading", { name: "Loading..." })).toBeInTheDocument();

        mocks.useFilm.mockReturnValueOnce({
            data: undefined,
            isLoading: false,
            error: new Error("Request failed"),
        });
        rerender(<EditFilmPage />);

        expect(screen.getByRole("alert")).toHaveTextContent("Error loading film: Request failed");

        mocks.useFilm.mockReturnValueOnce({
            data: undefined,
            isLoading: false,
            error: null,
        });
        rerender(<EditFilmPage />);

        expect(screen.getByRole("heading", { name: "Film not found" })).toBeInTheDocument();
    });

    it("configures FilmForm for edit mode", () => {
        render(<EditFilmPage />);

        const props = getFilmFormProps();
        expect(props.initialFilm).toBe(film);
        expect(props.confirmMessage).toBe("Confirm update film?");
        expect(props.isPending).toBe(false);
        expect(props.isChanged(fillForm(film), null)).toBe(false);
        expect(props.isChanged(fillForm(film), new File(["poster"], "poster.jpg"))).toBe(true);
    });

    it("updates a film, deletes the old poster, and navigates to the updated film", () => {
        const updatedFilm = { ...film, id: 2 };
        mocks.updateFilmMutate.mockImplementation((_variables: unknown, options?: MutationOptions<Film>) => {
            options?.onSuccess?.(updatedFilm);
        });
        render(<EditFilmPage />);

        const onSuccess = vi.fn();
        const onError = vi.fn();
        getFilmFormProps().onSave(request, { onSuccess, onError });

        expect(mocks.updateFilmMutate).toHaveBeenCalledWith(
            { id: 1, request },
            expect.objectContaining({ onSuccess: expect.any(Function), onError }),
        );
        expect(mocks.deleteFileMutate).toHaveBeenCalledWith("old.jpg");
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(mocks.navigate).toHaveBeenCalledWith("/films/2");
    });

    it("forwards update errors to FilmForm", () => {
        const error = new Error("Save failed");
        mocks.updateFilmMutate.mockImplementation((_variables: unknown, options?: MutationOptions<Film>) => {
            options?.onError?.(error);
        });
        render(<EditFilmPage />);

        const onSuccess = vi.fn();
        const onError = vi.fn();
        getFilmFormProps().onSave(request, { onSuccess, onError });

        expect(onError).toHaveBeenCalledWith(error);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(mocks.deleteFileMutate).not.toHaveBeenCalled();
    });

    it("navigates back to the film on cancel", () => {
        render(<EditFilmPage />);

        getFilmFormProps().onCancel();

        expect(mocks.navigate).toHaveBeenCalledWith("/films/1");
    });
});
