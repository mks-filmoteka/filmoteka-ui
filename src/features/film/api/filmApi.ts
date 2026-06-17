import apiClient from "../../../shared/api/client.ts";
import type {Page} from "../types/page.ts";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Film} from "../types/film";


export async function getFilms(
    page: number,
    title: string | undefined,
    yearFrom: number | undefined,
    yearTo: number | undefined,
    genres: string[] | undefined,
    country: string[] | undefined
) {
    const response =
        await apiClient.get<Page<FilmBasic>>("/films", {
            params: {page, title, yearFrom, yearTo, genres, country},
            paramsSerializer: {indexes: null}
        });
    return response.data;
}

export async function getFilmById(id: string) {
    const response = await apiClient.get<Film>(`/films/${id}`);
    return response.data;
}