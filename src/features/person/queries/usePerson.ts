import { useQuery } from "@tanstack/react-query";
import { getPersonById } from "../api/personApi";

export function usePerson(id?: number) {
    return useQuery({
        queryKey: ["person", id],
        enabled: !!id,
        queryFn: () => {
            if (!id) {
                throw new Error("Person id is required");
            }
            return getPersonById(id);
        },
    });
}
