import {useQuery} from "@tanstack/react-query";
import {getCollection} from "../api/collectionApi.ts";
import type {Collection} from "../types/collection.ts";
import {useAuth} from "../../../auth/useAuth.ts";

export function useCollection(id?: number) {
    const {authenticated} = useAuth();

    return useQuery<Collection>({
        queryKey: ["collection", id],
        enabled: authenticated && !!id,
        queryFn: () => {
            if (!id) throw new Error("Collection id is required");
            return getCollection(id);
        }
    });
}
