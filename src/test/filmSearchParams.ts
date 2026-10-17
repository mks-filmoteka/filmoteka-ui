import { vi } from "vitest";
import type { useFilmSearchParams } from "../features/film/queries/useFilmSearchParams.ts";

type FilmSearchParams = ReturnType<typeof useFilmSearchParams>;

export function testFilmSearchParams(overrides: Partial<FilmSearchParams> = {}): FilmSearchParams {
    return {
        title: undefined,
        pageParam: 1,
        view: "list",
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
    };
}
