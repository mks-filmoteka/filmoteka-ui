import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import type {ReactElement} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {FilmBasic} from "../types/filmBasic";
import type {Page} from "../types/page";
import FilmListPage from "./FilmListPage";

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

type FilmListMockProps = {
    films: FilmBasic[];
    pageTitle: ReactElement;
    page: number;
    totalPages: number;
};

type FilmFormMockProps = {
    onSave: () => void;
    setPosterFile: (file: File | null) => void;
    posterFile: File | null;
    apiError?: {message: string};
};

const mocks = vi.hoisted(() => ({
    useFilmSearchParams: vi.fn(),
    useFilmsQuery: vi.fn(),
    createFilmMutate: vi.fn(),
    uploadFileMutate: vi.fn(),
    deleteFileMutate: vi.fn(),
}));

vi.mock("../queries/useFilmSearchParams", () => ({
    useFilmSearchParams: mocks.useFilmSearchParams,
}));

vi.mock("../queries/useFilmsQuery.ts", () => ({
    useFilmsQuery: mocks.useFilmsQuery,
}));

vi.mock("../queries/useCreateFilm.ts", () => ({
    useCreateFilm: () => ({
        mutate: mocks.createFilmMutate,
        isPending: false,
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

vi.mock("../components/FilmList.tsx", () => ({
    FilmList: ({films, pageTitle, page, totalPages}: FilmListMockProps) => (
        <div>
            {pageTitle}
            <div data-testid="page">{page}</div>
            <div data-testid="total-pages">{totalPages}</div>
            {films.map(film => (
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
    mocks.useFilmsQuery.mockReturnValue({
        data: emptyPage,
        isLoading: false,
        error: null,
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

describe("FilmListPage", () => {
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

        render(<FilmListPage />);

        expect(mocks.useFilmsQuery).toHaveBeenCalledWith(
            2,
            "test title",
            1990,
            2020,
            ["SCI_FI"],
            ["UNITED_STATES", "CZECH_REPUBLIC"],
            sort
        );
    });

    it("corrects the URL page when it is out of bound", async () => {
        const setPage = vi.fn();
        mocks.useFilmSearchParams.mockReturnValue(createSearchParams({
            pageParam: 9,
            setPage,
        }));
        mocks.useFilmsQuery.mockReturnValue({
            data: {
                ...emptyPage,
                totalPages: 2,
            },
            isLoading: false,
            error: null,
        });

        render(<FilmListPage />);

        await waitFor(() => {
            expect(setPage).toHaveBeenCalledWith(2);
        });
    });

    it("deletes an uploaded poster when creating the film fails", async () => {
        mocks.createFilmMutate.mockImplementation(
            (_variables: unknown, options?: MutationOptions) => {
                options?.onError?.(apiError);
            }
        );

        render(<FilmListPage />);

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
