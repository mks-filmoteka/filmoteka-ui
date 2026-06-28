import apiClient from "../../../shared/api/client.ts";
import type {Page} from "../types/page.ts";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Film} from "../types/film";
import type {FilmRequest} from "../types/filmRequest.ts";


export async function getFilms(
    page: number,
    title: string | undefined,
    yearFrom: number | undefined,
    yearTo: number | undefined,
    genres: string[] | undefined,
    countries: string[] | undefined,
    sort: string[] | undefined,
) {
    const response =
        await apiClient.get<Page<FilmBasic>>("/films", {
            params: {page, title, yearFrom, yearTo, genres, countries, sort},
            paramsSerializer: {indexes: null}
        });
    return response.data;
}

export async function getFilmById(id: string) {
    const response = await apiClient.get<Film>(`/films/${id}`);
    return response.data;
}

export async function createFilm(request: FilmRequest) {
    const response = await apiClient.post<Film>("/films", request);
    return response.data;
}

export async function updateFilm(id: string, request: FilmRequest) {
    const response = await apiClient.put<Film>(`/films/${id}`, request);
    return response.data;
}

export async function deleteFilm(id: string) {
    const response = await apiClient.delete(`/films/${id}`);
    return response.data;
}