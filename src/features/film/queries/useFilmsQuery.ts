import { useQuery } from "@tanstack/react-query";
import { getFilms } from "../api/filmApi.ts";
import type { Film } from "../types/film.ts";
import type { Page } from "../types/page.ts";

export function useFilmsQuery() {
    return useQuery<Page<Film>>( {
        queryKey: ["films"],
        queryFn: getFilms,
    });
}