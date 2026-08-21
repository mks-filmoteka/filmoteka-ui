import {useQuery} from "@tanstack/react-query";
import {getCollections} from "../api/collectionApi.ts";
import type {Collection} from "../types/collection.ts";

export function useCollections() {
    return useQuery<Collection[]>({
        queryKey: ["collections"],
        queryFn: getCollections
    });
}
