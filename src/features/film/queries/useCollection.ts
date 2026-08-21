import {useQuery} from "@tanstack/react-query";
import {getFilmCollection} from "../api/filmApi.ts";
import type {FilmCollectionFilter} from "../types/filmFilter.ts";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Page} from "../types/page.ts";

export function useCollection(filter: FilmCollectionFilter, enabled = true) {
    const {page, ids, title, yearFrom, yearTo, genres, countries, sort} = filter;

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
            sort
        ],
        enabled: enabled && ids.length > 0,
        queryFn: () => getFilmCollection(filter),
        placeholderData: (previousData) => ids.length > 0 ? previousData : undefined
    });
}
