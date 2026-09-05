import { userClient } from "../../../shared/api/client.ts";
import type { Collection } from "../types/collection.ts";
import type { CollectionFilmsRequest } from "../types/collectionFilmsRequest.ts";
import type { CollectionRequest } from "../types/collectionRequest.ts";

export async function getCollections() {
    const response = await userClient.get<Collection[]>("/film-lists");
    return response.data;
}

export async function getCollection(id: number): Promise<Collection> {
    const response = await userClient.get<Collection>(`/film-lists/${id}`);
    return response.data;
}

export async function createCollection(request: CollectionRequest) {
    const response = await userClient.post<Collection>("/film-lists", request);
    return response.data;
}

export async function updateCollection(id: number, request: CollectionRequest) {
    const response = await userClient.put<Collection>(`/film-lists/${id}`, request);
    return response.data;
}

export async function deleteCollection(id: number) {
    await userClient.delete(`/film-lists/${id}`);
}

export async function addFilm(collectionId: number, filmId: number) {
    const response = await userClient.put<Collection>(`/film-lists/${collectionId}/films/${filmId}`);
    return response.data;
}

export async function removeFilm(collectionId: number, filmId: number) {
    await userClient.delete(`/film-lists/${collectionId}/films/${filmId}`);
}

export async function updateCollectionFilms(id: number, request: CollectionFilmsRequest) {
    const response = await userClient.patch<Collection>(`/film-lists/${id}/films`, request);
    return response.data;
}
