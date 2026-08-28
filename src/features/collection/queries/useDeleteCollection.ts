import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteCollection} from "../api/collectionApi.ts";

export function useDeleteCollection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            deleteCollection(id),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["collections"]})
    });
}
