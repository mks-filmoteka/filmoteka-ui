import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateCollectionFilms} from "../api/collectionApi.ts";
import type {CollectionFilmsRequest} from "../types/collectionFilmsRequest.ts";

export function useUpdateCollectionFilms() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (
            {collectionId, request}: { collectionId: string; request: CollectionFilmsRequest }
        ) => updateCollectionFilms(collectionId, request),
        onSuccess: (collection, variables) => {
            if (collection) {
                queryClient.setQueryData(["collection", variables.collectionId], collection);
            }

            return Promise.all([
                queryClient.invalidateQueries({queryKey: ["collections"]}),
                queryClient.invalidateQueries({queryKey: ["collection", variables.collectionId]}),
                queryClient.invalidateQueries({queryKey: ["films", "collection"]})
            ]);
        }
    });
}
