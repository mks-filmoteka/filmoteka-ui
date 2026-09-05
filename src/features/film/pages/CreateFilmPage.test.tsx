import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilmFormSaveOptions } from "../components/FilmForm.tsx";
import type { FilmRequest } from "../types/filmRequest.ts";
import CreateFilmPage from "./CreateFilmPage.tsx";

type FilmFormProps = {
    confirmMessage: string;
    isPending?: boolean;
    isChanged: (form: FilmRequest, posterFile: File | null) => boolean;
    onCancel: () => void;
    onSave: (request: FilmRequest, options: FilmFormSaveOptions) => void;
};

type MutationOptions = {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    useCreateFilm: vi.fn(),
    createFilmMutate: vi.fn(),
    filmForm: vi.fn(),
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<typeof import("react-router")>("react-router");

    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

vi.mock("../queries/useCreateFilm.ts", () => ({
    useCreateFilm: mocks.useCreateFilm,
}));

vi.mock("../components/FilmForm.tsx", () => ({
    FilmForm: (props: FilmFormProps) => {
        mocks.filmForm(props);
        return <div data-testid="film-form" />;
    },
}));

const request: FilmRequest = {
    title: "Test Title",
    releaseYear: 2000,
    countries: ["Poland"],
    description: "Test description",
    posterName: null,
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
    mocks.useCreateFilm.mockReturnValue({
        mutate: mocks.createFilmMutate,
        isPending: false,
    });
});

describe("CreateFilmPage", () => {
    it("configures FilmForm for create mode", () => {
        render(<CreateFilmPage />);

        const props = getFilmFormProps();
        expect(props.confirmMessage).toBe("Confirm create film?");
        expect(props.isPending).toBe(false);
        expect(props.isChanged(request, null)).toBe(true);
    });

    it("creates a film and navigates back to the film list", () => {
        mocks.createFilmMutate.mockImplementation((_variables: unknown, options?: MutationOptions) => {
            options?.onSuccess?.();
        });
        render(<CreateFilmPage />);

        const onSuccess = vi.fn();
        const onError = vi.fn();
        getFilmFormProps().onSave(request, { onSuccess, onError });

        expect(mocks.createFilmMutate).toHaveBeenCalledWith(
            { request },
            expect.objectContaining({ onSuccess: expect.any(Function), onError }),
        );
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(mocks.navigate).toHaveBeenCalledWith("/films");
    });

    it("navigates back to the film list on cancel", () => {
        render(<CreateFilmPage />);

        getFilmFormProps().onCancel();

        expect(mocks.navigate).toHaveBeenCalledWith("/films");
    });
});
