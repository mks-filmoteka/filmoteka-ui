import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addFilm} from "../api/collectionApi.ts";

export function useAddFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({collectionId, filmId}: { collectionId: string; filmId: string }) =>
            addFilm(collectionId, filmId),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({queryKey: ["collection", variables.collectionId]})
    });
}
