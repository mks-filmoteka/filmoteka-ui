import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createFilmList} from "../api/filmListApi.ts";
import type {FilmListRequest} from "../types/filmListRequest.ts";

export function useCreateFilmList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({request}: {request: FilmListRequest}) =>
            createFilmList(request),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["film-lists"]})
    });
}
