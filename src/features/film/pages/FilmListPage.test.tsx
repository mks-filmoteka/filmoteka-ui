import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import type {ReactElement} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {FilmBasic} from "../types/filmBasic";
import type {Page} from "../types/page";
import FilmListPage from "./FilmListPage";
import type {Collection} from "../../collection/types/collection.ts";

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
    onSave?: () => void;
    onCancel?: () => void;
    saveDisabled?: boolean;
    cancelDisabled?: boolean;
    selectedFilmIds?: ReadonlySet<number>;
    onFilmCheckedChange?: (filmId: number, checked: boolean) => void;
    selectionDisabled?: boolean;
};

type FilmFormMockProps = {
    onSave: () => void;
    setPosterFile: (file: File | null) => void;
    posterFile: File | null;
    apiError?: {message: string};
};

const mocks = vi.hoisted(() => ({
    routeParams: {} as Record<string, string | undefined>,
    useFilmSearchParams: vi.fn(),
    useFilms: vi.fn(),
    useCollectionFilms: vi.fn(),
    useCollection: vi.fn(),
    createFilmMutate: vi.fn(),
    updateCollectionFilmsMutate: vi.fn(),
    uploadFileMutate: vi.fn(),
    deleteFileMutate: vi.fn(),
}));

vi.mock("react-router", () => ({
    useParams: () => mocks.routeParams,
}));

vi.mock("../queries/useFilmSearchParams", () => ({
    useFilmSearchParams: mocks.useFilmSearchParams,
}));

vi.mock("../queries/useFilms.ts", () => ({
    useFilms: mocks.useFilms,
}));

vi.mock("../queries/useCollectionFilms.ts", () => ({
    useCollectionFilms: mocks.useCollectionFilms,
}));

vi.mock("../../collection/queries/useCollection.ts", () => ({
    useCollection: mocks.useCollection,
}));

vi.mock("../../collection/queries/useUpdateCollectionFilms.ts", () => ({
    useUpdateCollectionFilms: () => ({
        mutate: mocks.updateCollectionFilmsMutate,
        isPending: false,
    }),
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

vi.mock("../../../auth/useAuth.ts", () => ({
    useAuth: () => ({isAdmin: true}),
}));

vi.mock("../components/FilmList.tsx", () => ({
    FilmList: ({
        films,
        pageTitle,
        page,
        totalPages,
        onSave,
        onCancel,
        saveDisabled,
        cancelDisabled,
        selectedFilmIds,
        onFilmCheckedChange,
        selectionDisabled
    }: FilmListMockProps) => (
        <div>
            {pageTitle}
            <div role="toolbar">
                {onSave && onCancel && (
                    <>
                        <button onClick={onSave} disabled={saveDisabled}>Save</button>
                        <button onClick={onCancel} disabled={cancelDisabled}>Cancel</button>
                    </>
                )}
            </div>
            <div data-testid="page">{page}</div>
            <div data-testid="total-pages">{totalPages}</div>
            {onFilmCheckedChange ? (
                films.map(film => (
                    <label key={film.id}>
                        <input
                            type="checkbox"
                            aria-label={`Select ${film.title}`}
                            checked={selectedFilmIds?.has(film.id) ?? false}
                            disabled={selectionDisabled}
                            onChange={(event) =>
                                onFilmCheckedChange(film.id, event.currentTarget.checked)
                            }
                        />
                        {film.title}
                    </label>
                ))
            ) : (
                films.map(film => (
                    <div key={film.id}>{film.title}</div>
                ))
            )}
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

const film: FilmBasic = {
    id: 1,
    title: "Collection Film",
    releaseYear: 2000,
    countries: ["Poland"],
    posterName: null,
    genres: ["Drama"],
};

const outsideFilm: FilmBasic = {
    id: 3,
    title: "Outside Film",
    releaseYear: 2005,
    countries: ["France"],
    posterName: null,
    genres: ["Action"],
};

const collection: Collection = {
    id: "7",
    name: "Favorites",
    filmIds: [1, 2],
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
    mocks.routeParams = {};
    vi.stubGlobal("confirm", vi.fn(() => true));

    mocks.useFilmSearchParams.mockReturnValue(createSearchParams());
    mocks.useFilms.mockReturnValue({
        data: emptyPage,
        isLoading: false,
        error: null,
    });
    mocks.useCollectionFilms.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
    });
    mocks.useCollection.mockReturnValue({
        data: undefined,
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
    mocks.updateCollectionFilmsMutate.mockImplementation(
        (_variables: unknown, options?: MutationOptions<Collection>) => {
            options?.onSuccess?.(collection);
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

        expect(mocks.useFilms).toHaveBeenCalledWith(
            {
                page: 2,
                title: "test title",
                yearFrom: 1990,
                yearTo: 2020,
                genres: ["SCI_FI"],
                countries: ["UNITED_STATES", "CZECH_REPUBLIC"],
                sort,
            },
            true
        );
    });

    it("uses collection film data and hides create controls for collection routes", () => {
        mocks.routeParams = {id: "7"};
        mocks.useCollection.mockReturnValue({
            data: collection,
            isLoading: false,
            error: null,
        });
        mocks.useCollectionFilms.mockReturnValue({
            data: {
                ...emptyPage,
                content: [film],
                totalElements: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<FilmListPage source="collection" />);

        expect(mocks.useCollection).toHaveBeenCalledWith("7");
        expect(mocks.useFilms).toHaveBeenCalledWith(expect.any(Object), false);
        expect(mocks.useCollectionFilms).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 0,
                ids: [1, 2],
            }),
            true
        );
        expect(screen.getByText("Favorites")).toBeInTheDocument();
        expect(screen.getByText("Collection Film")).toBeInTheDocument();
        expect(screen.queryByTitle("Add new film")).not.toBeInTheDocument();
    });

    it("edits collection films by showing all films with checkbox state", () => {
        mocks.routeParams = {id: "7"};
        mocks.useCollection.mockReturnValue({
            data: collection,
            isLoading: false,
            error: null,
        });
        mocks.useFilms.mockReturnValue({
            data: {
                ...emptyPage,
                content: [film, outsideFilm],
                totalElements: 2,
            },
            isLoading: false,
            error: null,
        });
        mocks.useCollectionFilms.mockReturnValue({
            data: {
                ...emptyPage,
                content: [film],
                totalElements: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<FilmListPage source="collection" />);

        fireEvent.click(screen.getByTitle("Add films to collection"));

        const selectedCollectionFilm = screen.getByLabelText("Select Collection Film");
        const selectedOutsideFilm = screen.getByLabelText("Select Outside Film");

        expect(selectedCollectionFilm).toBeChecked();
        expect(selectedOutsideFilm).not.toBeChecked();

        fireEvent.click(selectedOutsideFilm);
        fireEvent.click(selectedCollectionFilm);
        fireEvent.click(screen.getByText("Save"));

        expect(mocks.updateCollectionFilmsMutate).toHaveBeenCalledWith(
            {
                collectionId: "7",
                request: {
                    addedFilmIds: [3],
                    removedFilmIds: [1],
                },
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            })
        );
    });

    it("cancels collection film editing without saving", () => {
        mocks.routeParams = {id: "7"};
        mocks.useCollection.mockReturnValue({
            data: collection,
            isLoading: false,
            error: null,
        });
        mocks.useFilms.mockReturnValue({
            data: {
                ...emptyPage,
                content: [film, outsideFilm],
                totalElements: 2,
            },
            isLoading: false,
            error: null,
        });
        mocks.useCollectionFilms.mockReturnValue({
            data: {
                ...emptyPage,
                content: [film],
                totalElements: 1,
            },
            isLoading: false,
            error: null,
        });

        render(<FilmListPage source="collection" />);

        fireEvent.click(screen.getByTitle("Add films to collection"));
        fireEvent.click(screen.getByLabelText("Select Outside Film"));
        fireEvent.click(screen.getByText("Cancel"));

        expect(mocks.updateCollectionFilmsMutate).not.toHaveBeenCalled();
        expect(screen.queryByLabelText("Select Outside Film")).not.toBeInTheDocument();
        expect(screen.getByText("Collection Film")).toBeInTheDocument();
    });

    it("corrects the URL page when it is out of bound", async () => {
        const setPage = vi.fn();
        mocks.useFilmSearchParams.mockReturnValue(createSearchParams({
            pageParam: 9,
            setPage,
        }));
        mocks.useFilms.mockReturnValue({
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
