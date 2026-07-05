import {mediaClient} from "../../../shared/api/client.ts";
import type {MediaFile} from "../types/mediaFile.ts";

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await mediaClient.post<MediaFile>("/media/files", formData);
    return response.data;
}

export function getFileUrl(fileName: string): string {
    return `http://localhost:8081/api/v1/media/files/${fileName}`;
}