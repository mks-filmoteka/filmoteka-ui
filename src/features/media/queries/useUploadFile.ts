import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "../api/mediaApi";

export function useUploadFile() {
    return useMutation({
        mutationFn: uploadFile,
    });
}