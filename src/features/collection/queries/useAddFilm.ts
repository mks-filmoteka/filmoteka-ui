import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addFilm} from "../api/collectionApi.ts";

export function useAddFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({collectionId, filmId}: { collectionId: number; filmId: number }) =>
            addFilm(collectionId, filmId),
        onSuccess: (_, variables) => Promise.all([
            queryClient.invalidateQueries({queryKey: ["collections"]}),
            queryClient.invalidateQueries({queryKey: ["collection", variables.collectionId]}),
            queryClient.invalidateQueries({queryKey: ["films", "collection"]})
        ])
    });
}
