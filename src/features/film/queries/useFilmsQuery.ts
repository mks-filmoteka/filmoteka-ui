import {useQuery} from "@tanstack/react-query";
import {getFilms} from "../api/filmApi.ts";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Page} from "../types/page.ts";

export function useFilmsQuery(
    page: number,
    title?: string,
    yearFrom?: number,
    yearTo?: number,
    genres?: string[],
    countries?: string[]
) {
    return useQuery<Page<FilmBasic>>({
        queryKey: ["films", page, title, yearFrom, yearTo, genres?.join(","), countries?.join(",")],
        queryFn: () => getFilms(page, title, yearFrom, yearTo, genres, countries),
        placeholderData: (previousData) => previousData
    });
}