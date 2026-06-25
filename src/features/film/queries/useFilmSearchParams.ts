import {useSearchParams} from "react-router-dom";
import {useCallback} from "react";
import {MAX_YEAR, MIN_YEAR, SORT_BY, SORT_DIR} from "../constants/constants.ts";
import {isGenre} from "../types/genre.ts";
import {isCountry} from "../types/country.ts";

export function useFilmSearchParams(resetPageOnChange = false) {
    const [searchParams, setSearchParams] = useSearchParams();
    const applyParam = (params: URLSearchParams, key: string, value: string | string[] | undefined) => {
        params.delete(key);
        if (value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
            return;
        }
        params.set(key, value);
    };
    const updateParams = useCallback(
        (changes: Record<string, string | string[] | undefined>, resetPage = resetPageOnChange) => {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                Object.entries(changes).forEach(([key, value]) => {
                    applyParam(params, key, value);
                });
                if (resetPage) {
                    params.set("page", "1");
                }
                return params;
            });
        }, [resetPageOnChange, setSearchParams]
    );

    const title = searchParams.get("title") ?? undefined;
    const pageUrl = Number(searchParams.get("page"));
    const pageParam = Number.isFinite(pageUrl) && pageUrl > 0 ? pageUrl : 1;
    const view = searchParams.get("view") ?? "list";
    const genres = searchParams.get("genres")
        ?.split(",")
        .map(g => g.toUpperCase())
        .filter(isGenre) ?? [];
    const countries = searchParams.get("countries")
        ?.split(",")
        .filter(isCountry) ?? [];
    const yearFromUrl = Number(searchParams.get("yearFrom"));
    const yearToUrl = Number(searchParams.get("yearTo"));
    const yearFrom =
        Number.isFinite(yearFromUrl) && yearFromUrl >= MIN_YEAR && yearFromUrl <= MAX_YEAR
            ? yearFromUrl
            : undefined;
    const yearTo =
        Number.isFinite(yearToUrl) && yearToUrl >= MIN_YEAR && yearToUrl <= MAX_YEAR
            ? yearToUrl
            : undefined;
    const minYear = yearFrom && yearTo ? Math.min(yearFrom, yearTo) : yearFrom;
    const maxYear = yearFrom && yearTo ? Math.max(yearFrom, yearTo) : yearTo;
    const sortParams = searchParams.getAll("sort")
        .map(s => s.split(","))
        .filter(([by, dir]) => SORT_BY.includes(by) && SORT_DIR.includes(dir))
        .map(([by, dir]) => ({by, dir}));
    const sort = sortParams.map(s => `${s.by},${s.dir}`);

    return {
        title, pageParam, view, genres, yearFrom, yearTo, minYear, maxYear, countries, sortParams, sort,
        setPage: (value: number) => updateParams({page: String(value)}, false),
        setView: (value: string) => updateParams({view: value}, false),
        setGenres: (values: string[]) =>
            updateParams({genres: values?.length ? values.join(",") : undefined}),
        setYearFrom: (from?: number) => updateParams({yearFrom: from?.toString()}),
        setYearTo: (to?: number) => updateParams({yearTo: to?.toString()}),
        resetYears: () => updateParams({yearFrom: undefined, yearTo: undefined}),
        setCountries: (values: string[]) =>
            updateParams({countries: values?.length ? values.join(",") : undefined}),
        setSort: (sort: { by?: string, dir?: string }[]) =>
            updateParams({sort: sort.map(s => `${s.by},${s.dir}`)})
    };
}