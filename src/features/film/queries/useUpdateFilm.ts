import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateFilm} from "../api/filmApi";
import type {FilmRequest} from "../types/filmRequest.ts";

export function useUpdateFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, request}: { id: string; request: FilmRequest }) =>
            updateFilm(id, request),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({queryKey: ["film", variables.id]})
    });
}