import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {Collection} from "../types/collection.ts";
import type {FilmBasic} from "../../film/types/filmBasic.ts";
import type {Page} from "../../film/types/page.ts";
import CollectionPage from "./CollectionPage.tsx";

type MutationOptions<TData = unknown> = {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
};

type FilmListScreenMockProps = {
    filmsData?: Page<FilmBasic>;
    title?: string;
    titleAction?: {
        title: string;
        onClick: () => void;
    };
    onSave?: () => void;
    onCancel?: () => void;
    saveDisabled?: boolean;
    cancelDisabled?: boolean;
    selectedFilmIds?: ReadonlySet<number>;
    onFilmCheckedChange?: (filmId: number, checked: boolean) => void;
    selectionDisabled?: boolean;
};

const mocks = vi.hoisted(() => ({
    useParams: vi.fn(),
    useFilmListSearchState: vi.fn(),
    useFilms: vi.fn(),
    useCollectionFilms: vi.fn(),
    useCollection: vi.fn(),
    useUpdateCollectionFilms: vi.fn(),
    updateCollectionFilmsMutate: vi.fn(),
}));

vi.mock("react-router", () => ({
    useParams: mocks.useParams,
}));

vi.mock("../../film/queries/useFilmListSearchState.ts", () => ({
    useFilmListSearchState: mocks.useFilmListSearchState,
}));

vi.mock("../../film/queries/useFilms.ts", () => ({
    useFilms: mocks.useFilms,
}));

vi.mock("../../film/queries/useCollectionFilms.ts", () => ({
    useCollectionFilms: mocks.useCollectionFilms,
}));

vi.mock("../queries/useCollection.ts", () => ({
    useCollection: mocks.useCollection,
}));

vi.mock("../queries/useUpdateCollectionFilms.ts", () => ({
    useUpdateCollectionFilms: mocks.useUpdateCollectionFilms,
}));

vi.mock("../../film/components/FilmListScreen.tsx", () => ({
    FilmListScreen: ({
        filmsData,
        title,
        titleAction,
        onSave,
        onCancel,
        saveDisabled,
        cancelDisabled,
        selectedFilmIds,
        onFilmCheckedChange,
        selectionDisabled,
    }: FilmListScreenMockProps) => (
        <div>
            <h1>{title}</h1>
            {titleAction && (
                <button title={titleAction.title} onClick={titleAction.onClick}>
                    add
                </button>
            )}
            {onSave && onCancel && (
                <>
                    <button onClick={onSave} disabled={saveDisabled}>Save</button>
                    <button onClick={onCancel} disabled={cancelDisabled}>Cancel</button>
                </>
            )}
            {onFilmCheckedChange ? (
                filmsData?.content.map(film => (
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
                filmsData?.content.map(film => (
                    <div key={film.id}>{film.title}</div>
                ))
            )}
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
    id: 7,
    name: "Favorites",
    filmIds: [1, 2],
};

const createSearchState = () => ({
    filmFilter: {
        page: 0,
        genres: [],
        countries: [],
        sort: [],
    },
    genres: [],
    countries: [],
});

beforeEach(() => {
    vi.clearAllMocks();

    mocks.useParams.mockReturnValue({id: "7"});
    mocks.useFilmListSearchState.mockReturnValue(createSearchState());
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
    mocks.useUpdateCollectionFilms.mockReturnValue({
        mutate: mocks.updateCollectionFilmsMutate,
        isPending: false,
    });
    mocks.updateCollectionFilmsMutate.mockImplementation(
        (_variables: unknown, options?: MutationOptions<Collection>) => {
            options?.onSuccess?.(collection);
        }
    );
});

describe("CollectionPage", () => {
    it("uses collection film data and hides create controls", () => {
        render(<CollectionPage />);

        expect(mocks.useCollection).toHaveBeenCalledWith(7);
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
        expect(screen.getByTitle("Add films to Favorites")).toBeInTheDocument();
        expect(screen.queryByTitle("Add new film")).not.toBeInTheDocument();
    });

    it("edits collection films by showing all films with checkbox state", () => {
        render(<CollectionPage />);

        fireEvent.click(screen.getByTitle("Add films to Favorites"));

        const selectedCollectionFilm = screen.getByLabelText("Select Collection Film");
        const selectedOutsideFilm = screen.getByLabelText("Select Outside Film");

        expect(selectedCollectionFilm).toBeChecked();
        expect(selectedOutsideFilm).not.toBeChecked();

        fireEvent.click(selectedOutsideFilm);
        fireEvent.click(selectedCollectionFilm);
        fireEvent.click(screen.getByText("Save"));

        expect(mocks.updateCollectionFilmsMutate).toHaveBeenCalledWith(
            {
                collectionId: 7,
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
        render(<CollectionPage />);

        fireEvent.click(screen.getByTitle("Add films to Favorites"));
        fireEvent.click(screen.getByLabelText("Select Outside Film"));
        fireEvent.click(screen.getByText("Cancel"));

        expect(mocks.updateCollectionFilmsMutate).not.toHaveBeenCalled();
        expect(screen.queryByLabelText("Select Outside Film")).not.toBeInTheDocument();
        expect(screen.getByText("Collection Film")).toBeInTheDocument();
    });
});
