import {useQuery} from "@tanstack/react-query";
import {getFilmList} from "../api/filmListApi.ts";
import type {FilmList} from "../types/filmList.ts";

export function useFilmList(id?: number) {
    return useQuery<FilmList>({
        queryKey: ["film-list", id],
        enabled: !!id,
        queryFn: () => {
            if (!id) throw new Error("Film list id is required");
            return getFilmList(id);
        }
    });
}
