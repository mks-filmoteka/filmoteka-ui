import {useSearchParams} from "react-router-dom";
import {useCallback} from "react";
import {COUNTRIES, GENRES, MAX_YEAR, MIN_YEAR, SORT_BY, SORT_DIR} from "../constants/constants.ts";


export function useFilmSearchParams() {
    const [searchParams, setSearchParams] = useSearchParams();
    const updateParams = useCallback(
        (changes: Record<string, string | undefined>) => {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                Object.entries(changes).forEach(([key, value]) => {
                    if (value) {
                        params.set(key, value);
                    } else {
                        params.delete(key);
                    }
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
    const sortUrl = searchParams.get("sort");
    const [sortByUrl, sortDirUrl] = sortUrl?.split(",") ?? [];
    const sortBy = SORT_BY.includes(sortByUrl) ? sortByUrl : undefined;
    const sortDir = SORT_DIR.includes(sortDirUrl) ? sortDirUrl : undefined;
    const sort = sortBy && sortDir ? `${sortBy},${sortDir}` : undefined;

    return {
        title, pageParam, view, genres, yearFrom, yearTo, countries, sortBy, sortDir, sort,
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
        setSort: (by?: string, dir?: string) =>
            updateParams({
                sort: by && dir ? `${by},${dir}` : undefined,
                page: "1",
            })
    };
}