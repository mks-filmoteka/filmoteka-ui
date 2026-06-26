import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updatePerson} from "../api/personApi.ts";
import type {PersonRequest} from "../types/personRequest.ts";

export function useUpdatePerson(type: "actor" | "director") {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, request}: { id: string; request: PersonRequest; }) =>
            updatePerson(type, id, request),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({queryKey: ["person", type, variables.id]})
    });
}