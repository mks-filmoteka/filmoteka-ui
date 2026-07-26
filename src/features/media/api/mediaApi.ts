import {mediaClient, MEDIA_API_URL} from "../../../shared/api/client.ts";
import type {MediaFile} from "../types/mediaFile.ts";

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await mediaClient.post<MediaFile>("/media/files", formData);
    return response.data;
}

export function getFileUrl(fileName: string): string {
    return `${MEDIA_API_URL}/media/files/${encodeURIComponent(fileName)}`;
}

export async function deleteFile(fileName: string) {
    const response = await mediaClient.delete(`/media/files/${encodeURIComponent(fileName)}`);
    return response.data;
}