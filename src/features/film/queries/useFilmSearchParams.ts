import {useSearchParams} from "react-router-dom";
import {useCallback} from "react";
import {COUNTRIES, GENRES, MAX_YEAR, MIN_YEAR, SORT_BY, SORT_DIR} from "../constants/constants.ts";

export function useFilmSearchParams() {
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
        (changes: Record<string, string | string[] | undefined>) => {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                Object.entries(changes).forEach(([key, value]) => {
                    applyParam(params, key, value);
                });
                return params;
            });
        }, [setSearchParams]
    );

    const title = searchParams.get("title") ?? undefined;
    const pageUrl = Number(searchParams.get("page"));
    const pageParam = Number.isFinite(pageUrl) && pageUrl > 0 ? pageUrl : 1;
    const view = searchParams.get("view") ?? "list";
    const genres = searchParams.get("genres")
        ?.split(",")
        .map(g => g.toUpperCase())
        .filter(g => GENRES.includes(g)) ?? [];
    const countries = searchParams.get("countries")
        ?.split(",")
        .filter(c => COUNTRIES.includes(c)) ?? [];
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
    const sortParams = searchParams.getAll("sort")
        .map(s => s.split(","))
        .filter(([by, dir]) => SORT_BY.includes(by) && SORT_DIR.includes(dir))
        .map(([by, dir]) => ({by, dir}));
    const sort = sortParams.map(s => `${s.by},${s.dir}`);

    return {
        title, pageParam, view, genres, yearFrom, yearTo, countries, sortParams, sort,
        setPage: (value: number) =>
            updateParams({
                page: String(value)
            }),
        setView: (value: string) =>
            updateParams({
                view: value
            }),
        setGenres: (values: string[]) =>
            updateParams({
                genres: values?.length ? values.join(",") : undefined,
                page: "1"
            }),
        setYearFrom: (from?: number) =>
            updateParams({
                yearFrom: from?.toString(),
                page: "1"
            }),
        setYearTo: (to?: number) =>
            updateParams({
                yearTo: to?.toString(),
                page: "1"
            }),
        resetYears: () =>
            updateParams({
                yearFrom: undefined,
                yearTo: undefined,
                page: "1"
            }),
        setCountries: (values: string[]) =>
            updateParams({
                countries: values?.length ? values.join(",") : undefined,
                page: "1"
            }),
        setSort: (sort: { by?: string, dir?: string }[]) =>
            updateParams({
                sort: sort.map(s => `${s.by},${s.dir}`),
                page: "1",
            })
    };
}