import {useQuery} from "@tanstack/react-query";
import {getPersonById} from "../api/personApi";

export function usePersonQuery(type?: "actor" | "director", id?: string) {
    return useQuery({
        queryKey: ["person", type, id],
        enabled: !!type && !!id,
        queryFn: () => {
            if (!type || !id) {
                throw new Error("Person type and id are required");
            }
            return getPersonById(type, id);
        }
    });
}