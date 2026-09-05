import { useQuery } from "@tanstack/react-query";
import { getCollectionFilms } from "../api/filmApi.ts";
import type { CollectionFilmFilter } from "../types/filmFilter.ts";
import type { FilmBasic } from "../types/filmBasic.ts";
import type { Page } from "../types/page.ts";

export function useCollectionFilms(filter: CollectionFilmFilter, enabled = true) {
    const { page, ids, title, yearFrom, yearTo, genres, countries, sort } = filter;

    return useQuery<Page<FilmBasic>>({
        queryKey: [
            "films",
            "collection",
            page,
            ids.join(","),
            title,
            yearFrom,
            yearTo,
            genres?.join(","),
            countries?.join(","),
            sort,
        ],
        enabled: enabled && ids.length > 0,
        queryFn: () => getCollectionFilms(filter),
        placeholderData: (previousData) => (ids.length > 0 ? previousData : undefined),
    });
}
