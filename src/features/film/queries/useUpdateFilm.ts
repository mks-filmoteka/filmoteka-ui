import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFilm } from "../api/filmApi";
import type { FilmRequest } from "../types/filmRequest.ts";

export function useUpdateFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: FilmRequest }) => updateFilm(id, request),
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["film", variables.id] }),
                queryClient.invalidateQueries({ queryKey: ["films"] }),
            ]);
        },
    });
}
