import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteFilm} from "../api/filmApi.ts";

export function useDeleteFilm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            deleteFilm(id),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["films"]})
    });
}