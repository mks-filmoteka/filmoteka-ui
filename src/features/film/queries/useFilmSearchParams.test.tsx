import type {ReactNode} from "react";
import {act, renderHook} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {describe, expect, it} from "vitest";
import {useFilmSearchParams} from "./useFilmSearchParams";

function renderUseFilmSearchParams(initialEntry: string, resetPageOnChange = false) {
    function Wrapper({children}: { children: ReactNode }) {
        return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
    }

    return renderHook(() => useFilmSearchParams(resetPageOnChange), {wrapper: Wrapper});
}

describe("useFilmSearchParams", () => {
    it("parses and validates supported query params", () => {
        const {result} = renderUseFilmSearchParams(
            "/?title=Test+Title&page=3&view=grid&genres=Drama,Invalid&countries=Poland,Narnia" +
            "&yearFrom=2020&yearTo=1990&sort=title,asc&sort=bad,desc&sort=releaseYear,back"
        );

        expect(result.current.title).toBe("Test Title");
        expect(result.current.pageParam).toBe(3);
        expect(result.current.view).toBe("grid");
        expect(result.current.genres).toEqual(["Drama"]);
        expect(result.current.countries).toEqual(["Poland"]);
        expect(result.current.yearFrom).toBe(2020);
        expect(result.current.yearTo).toBe(1990);
        expect(result.current.minYear).toBe(1990);
        expect(result.current.maxYear).toBe(2020);
        expect(result.current.sortParams).toEqual([{by: "title", dir: "asc"}]);
        expect(result.current.sort).toEqual(["title,asc"]);
    });

    it("falls back to defaults for invalid page and out-of-range years", () => {
        const {result} = renderUseFilmSearchParams("/?page=-2&yearFrom=1800&yearTo=2201");

        expect(result.current.pageParam).toBe(1);
        expect(result.current.yearFrom).toBeUndefined();
        expect(result.current.yearTo).toBeUndefined();
        expect(result.current.minYear).toBeUndefined();
        expect(result.current.maxYear).toBeUndefined();
    });

    it("resets page when configured filter setters change query params", () => {
        const {result} = renderUseFilmSearchParams("/?page=4&genres=Drama", true);

        act(() => {
            result.current.setCountries(["Poland", "France"]);
        });

        expect(result.current.pageParam).toBe(1);
        expect(result.current.genres).toEqual(["Drama"]);
        expect(result.current.countries).toEqual(["Poland", "France"]);
    });

    it("updates pagination without forcing a page reset", () => {
        const {result} = renderUseFilmSearchParams("/?page=2&countries=Poland", true);

        act(() => {
            result.current.setPage(5);
        });

        expect(result.current.pageParam).toBe(5);
        expect(result.current.countries).toEqual(["Poland"]);
    });
});
