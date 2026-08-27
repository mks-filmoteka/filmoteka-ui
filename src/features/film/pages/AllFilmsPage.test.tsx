import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {FilmBasic} from "../types/filmBasic";
import type {Page} from "../types/page";
import AllFilmsPage from "./AllFilmsPage.tsx";

type MutationOptions<TData = unknown> = {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
};

type SearchParamsReturn = {
    title?: string;
    pageParam: number;
    view: string;
    yearFrom?: number;
    yearTo?: number;
    minYear?: number;
    maxYear?: number;
    genres: string[];
    countries: string[];
    sort: string[];
    sortParams: {by?: string; dir?: string}[];
    setPage: (page: number) => void;
    setView: (view: string) => void;
    setGenres: (genres: string[]) => void;
    setYearFrom: (year?: number) => void;
    setYearTo: (year?: number) => void;
    resetYears: () => void;
    setCountries: (countries: string[]) => void;
    setSort: (sort: {by?: string; dir?: string}[]) => void;
};

type FilmFormMockProps = {
    onSave: () => void;
    setPosterFile: (file: File | null) => void;
    posterFile: File | null;
    apiError?: {message: string};
};

type FilmListScreenMockProps = {
    filmsData?: Page<FilmBasic>;
    title?: string;
    titleAction?: {
        title: string;
        onClick: () => void;
    };
};

const mocks = vi.hoisted(() => ({
    useFilmSearchParams: vi.fn(),
    useFilms: vi.fn(),
    useCreateFilm: vi.fn(),
    createFilmMutate: vi.fn(),
    useUploadFile: vi.fn(),
    uploadFileMutate: vi.fn(),
    useDeleteFile: vi.fn(),
    deleteFileMutate: vi.fn(),
}));

vi.mock("../queries/useFilmSearchParams", () => ({
    useFilmSearchParams: mocks.useFilmSearchParams,
}));

vi.mock("../queries/useFilms.ts", () => ({
    useFilms: mocks.useFilms,
}));

vi.mock("../queries/useCreateFilm.ts", () => ({
    useCreateFilm: mocks.useCreateFilm,
}));

vi.mock("../../media/queries/useUploadFile.ts", () => ({
    useUploadFile: mocks.useUploadFile,
}));

vi.mock("../../media/queries/useDeleteFile.ts", () => ({
    useDeleteFile: mocks.useDeleteFile,
}));

vi.mock("../../../auth/useAuth.ts", () => ({
    useAuth: () => ({isAdmin: true}),
}));

vi.mock("../components/FilmListScreen.tsx", () => ({
    FilmListScreen: ({filmsData, title, titleAction}: FilmListScreenMockProps) => (
        <div>
            <h1>{title}</h1>
            {titleAction && (
                <button title={titleAction.title} onClick={titleAction.onClick}>
                    add
                </button>
            )}
            {filmsData?.content.map(film => (
                <div key={film.id}>{film.title}</div>
            ))}
        </div>
    ),
}));

vi.mock("../components/FilmForm.tsx", () => ({
    FilmForm: ({
        onSave,
        setPosterFile,
        posterFile,
        apiError,
    }: FilmFormMockProps) => (
        <div>
            <button
                onClick={() =>
                    setPosterFile(new File(["poster"], "poster.jpg", {type: "image/jpeg"}))
                }
            >
                select poster
            </button>
            <button onClick={onSave}>save film</button>
            <div data-testid="poster-file">{posterFile?.name ?? ""}</div>
            {apiError && <div>{apiError.message}</div>}
        </div>
    ),
}));

const emptyPage: Page<FilmBasic> = {
    content: [],
    totalElements: 0,
    totalPages: 1,
    size: 20,
    page: 0,
};

const createSearchParams = (overrides: Partial<SearchParamsReturn> = {}): SearchParamsReturn => ({
    title: undefined,
    pageParam: 1,
    view: "grid",
    yearFrom: undefined,
    yearTo: undefined,
    minYear: undefined,
    maxYear: undefined,
    genres: [],
    countries: [],
    sort: [],
    sortParams: [],
    setPage: vi.fn(),
    setView: vi.fn(),
    setGenres: vi.fn(),
    setYearFrom: vi.fn(),
    setYearTo: vi.fn(),
    resetYears: vi.fn(),
    setCountries: vi.fn(),
    setSort: vi.fn(),
    ...overrides,
});

const apiError = Object.assign(new Error("Create failed"), {
    response: {
        data: {
            message: "Create failed",
            errorDetails: [{field: "title", message: "Required"}],
        },
    },
});

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));

    mocks.useFilmSearchParams.mockReturnValue(createSearchParams());
    mocks.useFilms.mockReturnValue({
        data: emptyPage,
        isLoading: false,
        error: null,
    });
    mocks.useCreateFilm.mockReturnValue({
        mutate: mocks.createFilmMutate,
        isPending: false,
    });
    mocks.useUploadFile.mockReturnValue({
        mutate: mocks.uploadFileMutate,
        isPending: false,
    });
    mocks.useDeleteFile.mockReturnValue({
        mutate: mocks.deleteFileMutate,
    });
    mocks.uploadFileMutate.mockImplementation(
        (_file: File, options?: MutationOptions<{fileName: string}>) => {
            options?.onSuccess?.({fileName: "new.jpg"});
        }
    );
    mocks.createFilmMutate.mockImplementation(
        (_variables: unknown, options?: MutationOptions) => {
            options?.onSuccess?.({});
        }
    );
});

describe("AllFilmsPage", () => {
    it("transforms URL filter values before querying films", () => {
        const sort = ["title,asc"];
        mocks.useFilmSearchParams.mockReturnValue(createSearchParams({
            title: "test title",
            pageParam: 3,
            minYear: 1990,
            maxYear: 2020,
            genres: ["Sci-Fi"],
            countries: ["United States", "Czech Republic"],
            sort,
            sortParams: [{by: "title", dir: "asc"}],
        }));

        render(<AllFilmsPage />);

        expect(mocks.useFilms).toHaveBeenCalledWith({
            page: 2,
            title: "test title",
            yearFrom: 1990,
            yearTo: 2020,
            genres: ["SCI_FI"],
            countries: ["UNITED_STATES", "CZECH_REPUBLIC"],
            sort,
        });
    });

    it("deletes an uploaded poster when creating the film fails", async () => {
        mocks.createFilmMutate.mockImplementation(
            (_variables: unknown, options?: MutationOptions) => {
                options?.onError?.(apiError);
            }
        );

        render(<AllFilmsPage />);

        fireEvent.click(screen.getByTitle("Add new film"));
        fireEvent.click(screen.getByText("select poster"));
        fireEvent.click(screen.getByText("save film"));

        await waitFor(() => {
            expect(mocks.createFilmMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    request: expect.objectContaining({posterName: "new.jpg"}),
                }),
                expect.any(Object)
            );
            expect(mocks.deleteFileMutate).toHaveBeenCalledWith("new.jpg");
        });
        expect(screen.getByText("Create failed")).toBeInTheDocument();
        expect(screen.getByText("save film")).toBeInTheDocument();
    });
});
