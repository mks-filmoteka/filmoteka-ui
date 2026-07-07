import {useMutation} from "@tanstack/react-query";
import {deleteFile} from "../api/mediaApi.ts";

export function useDeleteFile() {
    return useMutation({
        mutationFn: deleteFile,
    });
}