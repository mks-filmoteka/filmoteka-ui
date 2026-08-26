import {userClient} from "../../../shared/api/client.ts";
import type {Collection} from "../types/collection.ts";
import type {CollectionFilmsRequest} from "../types/collectionFilmsRequest.ts";
import type {CollectionRequest} from "../types/collectionRequest.ts";

export async function getCollections() {
    const response = await userClient.get<Collection[]>("/film-lists");
    return response.data;
}

export async function getCollection(id: string): Promise<Collection> {
    const response = await userClient.get<Collection>(`/film-lists/${id}`);
    return response.data;
}

export async function createCollection(request: CollectionRequest) {
    const response = await userClient.post<Collection>("/film-lists", request);
    return response.data;
}

export async function updateCollection(id: string, request: CollectionRequest) {
    const response = await userClient.put<Collection>(`/film-lists/${id}`, request);
    return response.data;
}

export async function deleteCollection(id: string) {
    await userClient.delete(`/film-lists/${id}`);
}

export async function addFilm(collectionId: string, filmId: string) {
    const response =
        await userClient.put<Collection>(`/film-lists/${collectionId}/films/${filmId}`);
    return response.data;
}

export async function removeFilm(collectionId: string, filmId: string) {
    await userClient.delete(`/film-lists/${collectionId}/films/${filmId}`);
}

export async function updateCollectionFilms(id: string, request: CollectionFilmsRequest) {
    const response =
        await userClient.patch<Collection>(`/film-lists/${id}/films`, request);
    return response.data;
}
