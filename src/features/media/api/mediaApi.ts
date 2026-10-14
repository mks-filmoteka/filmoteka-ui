import { mediaClient, MEDIA_API_URL, UPLOAD_TIMEOUT_MS } from "../../../shared/api/client.ts";
import type { MediaFile } from "../types/mediaFile.ts";

export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await mediaClient.post<MediaFile>("/media/files", formData, { timeout: UPLOAD_TIMEOUT_MS });
    return response.data;
}

export async function deleteFile(fileName: string): Promise<void> {
    await mediaClient.delete(`/media/files/${encodeURIComponent(fileName)}`);
}

export function getFileUrl(fileName: string): string {
    return `${MEDIA_API_URL}/media/files/${encodeURIComponent(fileName)}`;
}
