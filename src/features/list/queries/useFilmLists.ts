import {useQuery} from "@tanstack/react-query";
import {getFilmLists} from "../api/filmListApi.ts";
import type {FilmList} from "../types/filmList.ts";

export function useFilmLists() {
    return useQuery<FilmList[]>({
        queryKey: ["film-lists"],
        queryFn: getFilmLists
    });
}
