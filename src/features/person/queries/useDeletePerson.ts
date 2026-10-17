import { useMutation } from "@tanstack/react-query";
import { deletePerson } from "../api/personApi.ts";

export function useDeletePerson() {
    return useMutation({
        mutationFn: (id: number) => deletePerson(id),
    });
}
