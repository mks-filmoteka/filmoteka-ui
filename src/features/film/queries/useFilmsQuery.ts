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
    countries?: string[],
    sort?: string[]
) {
    return useQuery<Page<FilmBasic>>({
        queryKey: [
            "films",
            page,
            title,
            yearFrom,
            yearTo,
            genres?.join(","),
            countries?.join(","),
            sort
        ],
        queryFn: () => getFilms(page, title, yearFrom, yearTo, genres, countries, sort),
        placeholderData: (previousData) => previousData
    });
}