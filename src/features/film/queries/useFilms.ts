import { useQuery } from "@tanstack/react-query";
import { getFilms } from "../api/filmApi.ts";
import type { FilmBasic } from "../types/filmBasic.ts";
import type { FilmFilter } from "../types/filmFilter.ts";
import type { Page } from "../types/page.ts";

export function useFilms(filter: FilmFilter, enabled = true) {
    const { page, title, yearFrom, yearTo, genres, countries, sort } = filter;

    return useQuery<Page<FilmBasic>>({
        queryKey: ["films", page, title, yearFrom, yearTo, genres?.join(","), countries?.join(","), sort],
        enabled,
        queryFn: () => getFilms(page, title, yearFrom, yearTo, genres, countries, sort),
        placeholderData: (previousData) => previousData,
    });
}
