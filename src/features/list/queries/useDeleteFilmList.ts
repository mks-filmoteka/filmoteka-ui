import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteFilmList} from "../api/filmListApi.ts";

export function useDeleteFilmList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            deleteFilmList(id),
        onSuccess: () =>
            queryClient.invalidateQueries({queryKey: ["film-lists"]})
    });
}
