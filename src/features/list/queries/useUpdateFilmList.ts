import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateFilmList} from "../api/filmListApi.ts";
import type {FilmListRequest} from "../types/filmListRequest.ts";

export function useUpdateFilmList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, request}: { id: string; request: FilmListRequest }) =>
            updateFilmList(String(id), request),
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({queryKey: ["film-list", variables.id]})
    });
}
