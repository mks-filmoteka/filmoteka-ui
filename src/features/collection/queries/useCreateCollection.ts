import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCollection } from "../api/collectionApi.ts";
import type { CollectionRequest } from "../types/collectionRequest.ts";

export function useCreateCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ request }: { request: CollectionRequest }) => createCollection(request),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
    });
}
