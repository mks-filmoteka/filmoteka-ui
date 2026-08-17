import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addFilm} from "../api/filmListApi.ts";

export function useAddFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({listId, filmId}: { listId: number; filmId: number }) =>
            addFilm(listId, filmId),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({queryKey: ["film-list", variables.listId]})
    });
}
