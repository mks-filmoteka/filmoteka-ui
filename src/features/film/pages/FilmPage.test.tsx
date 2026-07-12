import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Film} from "../types/film";
import FilmPage from "./FilmPage";

type MutationOptions<TData = unknown> = {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
};

type FilmFormMockProps = {
    onSave: () => void;
    onCancel: () => void;
    setPosterFile: (file: File | null) => void;
    posterFile: File | null;
    apiError?: {message: string};
};

const mocks = vi.hoisted(() => ({
    useFilmQuery: vi.fn(),
    updateFilmMutate: vi.fn(),
    deleteFilmMutate: vi.fn(),
    uploadFileMutate: vi.fn(),
    deleteFileMutate: vi.fn(),
    navigate: vi.fn(),
}));

vi.mock("../queries/useFilmQuery.ts", () => ({
    useFilmQuery: mocks.useFilmQuery,
}));

vi.mock("../queries/useUpdateFilm.ts", () => ({
    useUpdateFilm: () => ({
        mutate: mocks.updateFilmMutate,
        isPending: false,
    }),
}));

vi.mock("../queries/useDeleteFilm.ts", () => ({
    useDeleteFilm: () => ({
        mutate: mocks.deleteFilmMutate,
    }),
}));

vi.mock("../../media/queries/useUploadFile.ts", () => ({
    useUploadFile: () => ({
        mutate: mocks.uploadFileMutate,
    }),
}));

vi.mock("../../media/queries/useDeleteFile.ts", () => ({
    useDeleteFile: () => ({
        mutate: mocks.deleteFileMutate,
    }),
}));

vi.mock("../../../shared/auth/useAuth.ts", () => ({
    useIsAdmin: () => true,
}));

vi.mock("../../../shared/queries/useRequiredParam.ts", () => ({
    useRequiredParam: () => "1",
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

vi.mock("../components/FilmDetails.tsx", () => ({
    FilmDetails: ({
        data,
        onEdit,
        onDelete,
    }: {
        data: {title: string};
        onEdit: () => void;
        onDelete: () => void;
    }) => (
        <div>
            <h1>{data.title}</h1>
            <button title="Edit" onClick={onEdit}>
                Edit
            </button>
            <button title="Delete" onClick={onDelete}>
                Delete
            </button>
        </div>
    ),
}));

vi.mock("../components/FilmForm.tsx", () => ({
    FilmForm: ({
        onSave,
        onCancel,
        setPosterFile,
        posterFile,
        apiError,
    }: FilmFormMockProps) => (
        <div>
            <button
                onClick={() =>
                    setPosterFile(new File(["poster"], "replacement.jpg", {type: "image/jpeg"}))
                }
            >
                select poster
            </button>
            <button onClick={onSave}>save film</button>
            <button onClick={onCancel}>cancel film</button>
            <div data-testid="poster-file">{posterFile?.name ?? ""}</div>
            {apiError && <div>{apiError.message}</div>}
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

const apiError = Object.assign(new Error("Update failed"), {
    response: {
        data: {
            message: "Validation failed",
            errorDetails: [{field: "title", message: "Required"}],
        },
    },
});

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));

    mocks.useFilmQuery.mockReturnValue({
        data: film,
        isLoading: false,
        error: null,
    });
    mocks.uploadFileMutate.mockImplementation(
        (_file: File, options?: MutationOptions<{fileName: string}>) => {
            options?.onSuccess?.({fileName: "new.jpg"});
        }
    );
    mocks.updateFilmMutate.mockImplementation(
        (_variables: unknown, options?: MutationOptions) => {
            options?.onSuccess?.({});
        }
    );
    mocks.deleteFilmMutate.mockImplementation(
        (_id: string, options?: MutationOptions) => {
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
    it("deletes the newly uploaded poster when updating the film fails", async () => {
        mocks.updateFilmMutate.mockImplementation(
            (_variables: unknown, options?: MutationOptions) => {
                options?.onError?.(apiError);
            }
        );

        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Edit"));
        fireEvent.click(screen.getByText("select poster"));
        fireEvent.click(screen.getByText("save film"));

        await waitFor(() => {
            expect(mocks.deleteFileMutate).toHaveBeenCalledWith("new.jpg");
        });
        expect(mocks.deleteFileMutate).not.toHaveBeenCalledWith("old.jpg");
        expect(screen.getByText("Validation failed")).toBeInTheDocument();
        expect(screen.getByText("save film")).toBeInTheDocument();
    });

    it("deletes the old poster after a successful poster replacement", async () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Edit"));
        fireEvent.click(screen.getByText("select poster"));
        fireEvent.click(screen.getByText("save film"));

        await waitFor(() => {
            expect(mocks.updateFilmMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "1",
                    request: expect.objectContaining({posterName: "new.jpg"}),
                }),
                expect.any(Object)
            );
        });
        expect(mocks.deleteFileMutate).toHaveBeenCalledWith("old.jpg");
        expect(mocks.deleteFileMutate).not.toHaveBeenCalledWith("new.jpg");
    });

    it("navigates back to the film list after deleted film poster cleanup settles", async () => {
        render(<FilmPage />);

        fireEvent.click(screen.getByTitle("Delete"));

        await waitFor(() => {
            expect(mocks.deleteFilmMutate).toHaveBeenCalledWith("1", expect.any(Object));
            expect(mocks.deleteFileMutate).toHaveBeenCalledWith("old.jpg", expect.any(Object));
            expect(mocks.navigate).toHaveBeenCalledWith("/films");
        });
    });
});
