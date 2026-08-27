import {render, screen, waitFor} from "@testing-library/react";
import type {ReactElement} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Page} from "../types/page.ts";
import {FilmListScreen} from "./FilmListScreen.tsx";
import type {FilmListSearchState} from "../queries/useFilmListSearchState.ts";

type FilmListMockProps = {
    films: FilmBasic[];
    pageTitle: ReactElement;
    page: number;
    pageSize: number;
    totalPages: number;
};

const mocks = vi.hoisted(() => ({
    filmList: vi.fn(),
}));

vi.mock("./FilmList.tsx", () => ({
    FilmList: (props: FilmListMockProps) => {
        mocks.filmList(props);

        return (
            <div>
                {props.pageTitle}
                <div data-testid="page">{props.page}</div>
                <div data-testid="page-size">{props.pageSize}</div>
                <div data-testid="total-pages">{props.totalPages}</div>
                {props.films.map(film => (
                    <div key={film.id}>{film.title}</div>
                ))}
            </div>
        );
    },
}));

const film: FilmBasic = {
    id: 1,
    title: "Test Film",
    releaseYear: 2000,
    countries: ["Poland"],
    posterName: null,
    genres: ["Drama"],
};

const filmsData: Page<FilmBasic> = {
    content: [film],
    totalElements: 1,
    totalPages: 3,
    size: 20,
    page: 0,
};

const createSearch = (overrides: Partial<FilmListSearchState> = {}): FilmListSearchState => ({
    filmFilter: {
        page: 0,
        genres: [],
        countries: [],
        sort: [],
    },
    pageParam: 1,
    view: "grid",
    yearFrom: undefined,
    yearTo: undefined,
    genres: [],
    countries: [],
    sortParams: [],
    filterOpen: false,
    setPage: vi.fn(),
    setView: vi.fn(),
    setGenres: vi.fn(),
    setYearFrom: vi.fn(),
    setYearTo: vi.fn(),
    resetYears: vi.fn(),
    setCountries: vi.fn(),
    setSort: vi.fn(),
    setFilterOpen: vi.fn(),
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("FilmListScreen", () => {
    it("forwards list data", () => {
        render(
            <FilmListScreen
                filmsData={filmsData}
                search={createSearch()}
            />
        );

        expect(screen.getByText("Test Film")).toBeInTheDocument();
        expect(screen.getByTestId("page")).toHaveTextContent("1");
        expect(screen.getByTestId("total-pages")).toHaveTextContent("3");
    });

    it("corrects the URL page when it is out of bound", async () => {
        const setPage = vi.fn();

        render(
            <FilmListScreen
                filmsData={{
                    ...filmsData,
                    totalPages: 2,
                }}
                search={createSearch({pageParam: 9, setPage})}
            />
        );

        await waitFor(() => {
            expect(setPage).toHaveBeenCalledWith(2);
        });
    });
});
