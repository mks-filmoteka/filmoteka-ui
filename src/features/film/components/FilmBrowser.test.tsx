import {render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {MemoryRouter} from "react-router";
import type {ReactElement} from "react";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Page} from "../types/page.ts";
import {FilmBrowser, type FilmBrowserSearchState} from "./FilmBrowser.tsx";

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

const createSearch = (overrides: Partial<FilmBrowserSearchState> = {}): FilmBrowserSearchState => ({
    pageParam: 1,
    view: "list",
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

function renderScreen(element: ReactElement) {
    return render(
        <MemoryRouter>
            {element}
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe("FilmBrowser", () => {
    it("forwards list data", () => {
        const {container} = renderScreen(
            <FilmBrowser
                filmsData={filmsData}
                search={createSearch()}
            />
        );

        expect(screen.getByText("Test Film (2000)")).toBeInTheDocument();
        expect(container.querySelector(".list-item-number")).toHaveTextContent("1");
        expect(screen.getByTitle("Last page: 3")).toBeInTheDocument();
    });

    it("uses the current page to offset displayed list indexes", () => {
        const {container} = renderScreen(
            <FilmBrowser
                filmsData={filmsData}
                search={createSearch({pageParam: 2})}
            />
        );

        expect(container.querySelector(".list-item-number")).toHaveTextContent("21");
    });

    it("corrects the URL page when it is out of bound", async () => {
        const setPage = vi.fn();

        renderScreen(
            <FilmBrowser
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
