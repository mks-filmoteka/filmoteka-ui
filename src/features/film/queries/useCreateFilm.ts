import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createFilm} from "../api/filmApi";
import type {FilmRequest} from "../types/filmRequest.ts";

export function useCreateFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({request}: {request: FilmRequest}) =>
            createFilm(request),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["film"]})
    });
}