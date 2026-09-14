import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCollection } from "../api/collectionApi.ts";
import type { CollectionRequest } from "../types/collectionRequest.ts";

export function useUpdateCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: CollectionRequest }) => updateCollection(id, request),
        onSuccess: async (_, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["collection", variables.id] }),
                queryClient.invalidateQueries({ queryKey: ["collections"] }),
            ]);
        },
    });
}
