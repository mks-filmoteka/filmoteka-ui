import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateCollection} from "../api/collectionApi.ts";
import type {CollectionRequest} from "../types/collectionRequest.ts";

export function useUpdateCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, request}: { id: string; request: CollectionRequest }) =>
            updateCollection(String(id), request),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({queryKey: ["collection", variables.id]})
    });
}
