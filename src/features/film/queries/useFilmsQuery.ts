import { useQuery } from "@tanstack/react-query";
import { getFilms } from "../api/filmApi.ts";
import type { FilmBasic } from "../types/filmBasic.ts";
import type { Page } from "../types/page.ts";

export function useFilmsQuery(page: number) {
    return useQuery<Page<FilmBasic>>( {
        queryKey: ["films", page],
        queryFn: () => getFilms(page),
    });
}