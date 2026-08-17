import {useMutation, useQueryClient} from "@tanstack/react-query";
import {removeFilm} from "../api/filmListApi.ts";

export function useRemoveFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({listId, filmId}: { listId: number; filmId: number }) =>
            removeFilm(listId, filmId),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({queryKey: ["film-list", variables.listId]})
    });
}
