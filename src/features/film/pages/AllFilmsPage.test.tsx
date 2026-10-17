import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilmBasic } from "../types/filmBasic";
import type { Page } from "../types/page";
import AllFilmsPage from "./AllFilmsPage.tsx";
import { testFilmSearchParams } from "../../../test/filmSearchParams";

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
    useAuth: () => ({ isAdmin: true }),
}));

vi.mock("../components/FilmBrowser.tsx", () => ({
    FilmBrowser: ({ filmsData }: FilmBrowserMockProps) => (
        <div>
            {filmsData?.content.map((film) => (
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

beforeEach(() => {
    vi.clearAllMocks();

    mocks.useFilmSearchParams.mockReturnValue(testFilmSearchParams());
    mocks.useFilms.mockReturnValue({
        data: emptyPage,
        isLoading: false,
        error: null,
    });
});

describe("AllFilmsPage", () => {
    it("transforms URL filter values before querying films", () => {
        const sort = ["title,asc"];
        mocks.useFilmSearchParams.mockReturnValue(
            testFilmSearchParams({
                title: "test title",
                pageParam: 3,
                minYear: 1990,
                maxYear: 2020,
                genres: ["Sci-Fi"],
                countries: ["United States", "Czech Republic"],
                sort,
                sortParams: [{ by: "title", dir: "asc" }],
            }),
        );

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
