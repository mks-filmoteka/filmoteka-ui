import {userClient} from "../../../shared/api/client.ts";
import type {FilmList} from "../types/filmList.ts";
import type {FilmListRequest} from "../types/FilmListRequest.ts";

export async function getFilmLists() {
    const response = await userClient.get<FilmList[]>("/film-lists");
    return response.data;
}

export async function getFilmList(id: number): Promise<FilmList> {
    const response = await userClient.get<FilmList>(`/film-lists/${id}`);
    return response.data;
}

export async function createFilmList(request: FilmListRequest) {
    const response = await userClient.post<FilmList>("/film-lists", request);
    return response.data;
}

export async function updateFilmList(id: number, request: FilmListRequest) {
    const response = await userClient.put<FilmList>(`/film-lists/${id}`, request);
    return response.data;
}

export async function deleteFilmList(id: number) {
    await userClient.delete(`/film-lists/${id}`);
}

export async function addFilm(listId: number, filmId: number) {
    const response =
        await userClient.post<FilmList>(`/film-lists/${listId}/films/${filmId}`);
    return response.data;
}

export async function removeFilm(listId: number, filmId: number) {
    const response =
        await userClient.delete<FilmList>(`/film-lists/${listId}/films/${filmId}`);
    return response.data;
}