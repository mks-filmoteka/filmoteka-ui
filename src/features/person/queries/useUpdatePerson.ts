import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePerson } from "../api/personApi.ts";
import type { PersonRequest } from "../types/personRequest.ts";

export function useUpdatePerson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: PersonRequest }) => updatePerson(id, request),
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ["person", variables.id] }),
    });
}
