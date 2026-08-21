import {useQuery} from "@tanstack/react-query";
import {getFilmById} from "../api/filmApi";

export function useFilm(id?: string) {
    return useQuery({
        queryKey: ["film", id],
        enabled: !!id,
        queryFn: () => {
            if (!id) throw new Error("FilmBasic id is required");
            return getFilmById(id);
        }
    });
}