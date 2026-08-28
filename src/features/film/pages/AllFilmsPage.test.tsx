import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {FilmBasic} from "../types/filmBasic";
import type {Page} from "../types/page";
import AllFilmsPage from "./AllFilmsPage.tsx";

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

type FilmBrowserMockProps = {
    filmsData?: Page<FilmBasic>;
};

const mocks = vi.hoisted(() => ({
    useFilmSearchParams: vi.fn(),
    useFilms: vi.fn(),
    navigate: vi.fn(),
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<typeof import("react-router")>("react-router");

    return {
        ...actual,
        useNavigate: () => mocks.navigate,
    };
});

vi.mock("../queries/useFilmSearchParams", () => ({
    useFilmSearchParams: mocks.useFilmSearchParams,
}));

vi.mock("../queries/useFilms.ts", () => ({
    useFilms: mocks.useFilms,
}));

vi.mock("../../../auth/useAuth.ts", () => ({
    useAuth: () => ({isAdmin: true}),
}));

vi.mock("../components/FilmBrowser.tsx", () => ({
    FilmBrowser: ({filmsData}: FilmBrowserMockProps) => (
        <div>
            {filmsData?.content.map(film => (
                <div key={film.id}>{film.title}</div>
            ))}
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

beforeEach(() => {
    vi.clearAllMocks();

    mocks.useFilmSearchParams.mockReturnValue(createSearchParams());
    mocks.useFilms.mockReturnValue({
        data: emptyPage,
        isLoading: false,
        error: null,
    });
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

    it("navigates to the film create page", () => {
        render(<AllFilmsPage />);

        fireEvent.click(screen.getByTitle("Add new film"));

        expect(mocks.navigate).toHaveBeenCalledWith("/films/new");
    });
});
