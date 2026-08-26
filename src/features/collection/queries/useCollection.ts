import {useQuery} from "@tanstack/react-query";
import {getCollection} from "../api/collectionApi.ts";
import type {Collection} from "../types/collection.ts";

export function useCollection(id?: string) {
    return useQuery<Collection>({
        queryKey: ["collection", id],
        enabled: !!id,
        queryFn: () => {
            if (!id) throw new Error("Collection id is required");
            return getCollection(id);
        }
    });
}
