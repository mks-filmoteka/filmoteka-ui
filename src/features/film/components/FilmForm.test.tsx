import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Film } from "../types/film.ts";
import type { FilmRequest } from "../types/filmRequest.ts";
import { FilmForm } from "./FilmForm.tsx";

type MutationOptions<TData = unknown> = {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
    useUploadFile: vi.fn(),
    uploadFileMutate: vi.fn(),
    useDeleteFile: vi.fn(),
    deleteFileMutate: vi.fn(),
}));

vi.mock("../../media/queries/useUploadFile.ts", () => ({
    useUploadFile: mocks.useUploadFile,
}));

vi.mock("../../media/queries/useDeleteFile.ts", () => ({
    useDeleteFile: mocks.useDeleteFile,
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

const validRequest: FilmRequest = {
    title: "Test Title",
    releaseYear: 2000,
    countries: ["Poland"],
    description: "Test description",
    posterName: "old.jpg",
    genres: ["Drama"],
    actors: [{ name: "Test Actor" }],
    directors: [{ name: "Test Director" }],
};

const apiError = Object.assign(new Error("Save failed"), {
    response: {
        data: {
            message: "Validation failed",
            errorDetails: [{ field: "title", message: "Required" }],
        },
    },
});

function renderFilmForm(
    props: {
        initialFilm?: Film;
        isPending?: boolean;
        isChanged?: (form: FilmRequest, posterFile: File | null) => boolean;
        onCancel?: () => void;
        onSave?: (request: FilmRequest, options: { onSuccess: () => void; onError: (error: Error) => void }) => void;
    } = {},
) {
    const onCancel = props.onCancel ?? vi.fn();
    const onSave = props.onSave ?? vi.fn();

    return {
        ...render(
            <FilmForm
                confirmMessage="Confirm save film?"
                initialFilm={props.initialFilm}
                isPending={props.isPending}
                isChanged={props.isChanged ?? (() => true)}
                onCancel={onCancel}
                onSave={onSave}
            />,
        ),
        onCancel,
        onSave,
    };
}

function fillRequiredFields(container: HTMLElement) {
    fireEvent.change(screen.getByLabelText("form title"), {
        target: { value: "Filled Film" },
    });
    fireEvent.change(screen.getByLabelText("form description"), {
        target: { value: "Filled description" },
    });

    const yearSelect = container.querySelector<HTMLSelectElement>("select");
    if (!yearSelect) {
        throw new Error("Year select not found");
    }
    fireEvent.change(yearSelect, { target: { value: "2000" } });

    fireEvent.click(screen.getByText("+ Add country"));
    fireEvent.click(screen.getByText("+ Add genre"));
    fireEvent.click(screen.getByText("+ Add actor"));
    fireEvent.change(screen.getByLabelText("actor 0"), {
        target: { value: "Actor" },
    });
    fireEvent.click(screen.getByText("+ Add director"));
    fireEvent.change(screen.getByLabelText("director 0"), {
        target: { value: "Director" },
    });
}

function selectPoster(container: HTMLElement) {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
        throw new Error("Poster input not found");
    }

    fireEvent.change(input, {
        target: {
            files: [new File(["poster"], "replacement.jpg", { type: "image/jpeg" })],
        },
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
        "confirm",
        vi.fn(() => true),
    );
    Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: vi.fn(() => "blob:poster"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: vi.fn(),
    });

    mocks.useUploadFile.mockReturnValue({
        mutate: mocks.uploadFileMutate,
        isPending: false,
    });
    mocks.useDeleteFile.mockReturnValue({
        mutate: mocks.deleteFileMutate,
    });
    mocks.uploadFileMutate.mockImplementation((_file: File, options?: MutationOptions<{ fileName: string }>) => {
        options?.onSuccess?.({ fileName: "new.jpg" });
    });
});

describe("FilmForm", () => {
    it("disables save when required fields are invalid", () => {
        renderFilmForm();

        expect(screen.getByTitle("Save film")).toBeDisabled();
    });

    it("disables save when nothing changed or a save is pending", () => {
        const { rerender } = render(
            <FilmForm
                confirmMessage="Confirm save film?"
                initialFilm={film}
                isChanged={() => false}
                onCancel={vi.fn()}
                onSave={vi.fn()}
            />,
        );

        expect(screen.getByTitle("Save film")).toBeDisabled();

        rerender(
            <FilmForm
                confirmMessage="Confirm save film?"
                initialFilm={film}
                isChanged={() => true}
                isPending
                onCancel={vi.fn()}
                onSave={vi.fn()}
            />,
        );

        expect(screen.getByTitle("Save film")).toBeDisabled();
    });

    it("submits a filled request after confirmation", async () => {
        const onSave = vi.fn((_request: FilmRequest, options: { onSuccess: () => void }) => {
            options.onSuccess();
        });
        const { container } = renderFilmForm({ onSave });

        fillRequiredFields(container);
        fireEvent.click(screen.getByTitle("Save film"));

        await waitFor(() => {
            expect(confirm).toHaveBeenCalledWith("Confirm save film?");
            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "Filled Film",
                    releaseYear: 2000,
                    description: "Filled description",
                    actors: [{ name: "Actor" }],
                    directors: [{ name: "Director" }],
                }),
                expect.any(Object),
            );
        });
    });

    it("calls cancel after resetting local state", () => {
        const onCancel = vi.fn();
        renderFilmForm({ initialFilm: film, onCancel });

        fireEvent.change(screen.getByLabelText("form title"), {
            target: { value: "Changed title" },
        });
        fireEvent.click(screen.getByTitle("Cancel film"));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(screen.getByLabelText("form title")).toHaveValue(validRequest.title);
    });

    it("deletes an uploaded poster when save fails", async () => {
        const onSave = vi.fn((_request: FilmRequest, options: { onError: (error: Error) => void }) => {
            options.onError(apiError);
        });
        const { container } = renderFilmForm({
            initialFilm: film,
            isChanged: (_form, posterFile) => posterFile !== null,
            onSave,
        });

        selectPoster(container);
        fireEvent.click(screen.getByTitle("Save film"));

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ posterName: "new.jpg" }), expect.any(Object));
            expect(mocks.deleteFileMutate).toHaveBeenCalledWith("new.jpg");
            expect(screen.getByText("Validation failed")).toBeInTheDocument();
        });
    });
});
