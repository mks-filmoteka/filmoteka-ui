import {useMutation, useQueryClient} from "@tanstack/react-query";
import {removeFilm} from "../api/collectionApi.ts";

export function useRemoveFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({collectionId, filmId}: { collectionId: number; filmId: number }) =>
            removeFilm(collectionId, filmId),
        onSuccess: (_, variables) => Promise.all([
            queryClient.invalidateQueries({queryKey: ["collections"]}),
            queryClient.invalidateQueries({queryKey: ["collection", variables.collectionId]}),
            queryClient.invalidateQueries({queryKey: ["films", "collection"]})
        ])
    });
}
