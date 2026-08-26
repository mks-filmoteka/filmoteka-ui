import {catalogClient} from "../../../shared/api/client.ts";
import type {Page} from "../types/page.ts";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Film} from "../types/film";
import type {FilmRequest} from "../types/filmRequest.ts";
import type {CollectionFilmFilter, FilmFilter} from "../types/filmFilter.ts";

function createFilmFilter(
    page: number,
    title: string | undefined,
    yearFrom: number | undefined,
    yearTo: number | undefined,
    genres: string[] | undefined,
    countries: string[] | undefined,
    sort: string[] | undefined
): FilmFilter {
    return {page, title, yearFrom, yearTo, genres, countries, sort};
}

export async function getFilms(
    page: number,
    title: string | undefined,
    yearFrom: number | undefined,
    yearTo: number | undefined,
    genres: string[] | undefined,
    countries: string[] | undefined,
    sort: string[] | undefined,
) {
    const filter = createFilmFilter(page, title, yearFrom, yearTo, genres, countries, sort);
    const response =
        await catalogClient.get<Page<FilmBasic>>("/films", {params: filter, paramsSerializer: {indexes: null}});
    return response.data;
}

export async function getCollectionFilms(filter: CollectionFilmFilter) {
    const {page, sort, ...request} = filter;
    const response =
        await catalogClient.post<Page<FilmBasic>>(
            "/films/collection",
            request,
            {params: {page, sort}, paramsSerializer: {indexes: null}}
        );
    return response.data;
}

export async function getFilmById(id: string) {
    const response = await catalogClient.get<Film>(`/films/${id}`);
    return response.data;
}

export async function createFilm(request: FilmRequest) {
    const response = await catalogClient.post<Film>("/films", request);
    return response.data;
}

export async function updateFilm(id: string, request: FilmRequest) {
    const response = await catalogClient.put<Film>(`/films/${id}`, request);
    return response.data;
}

export async function deleteFilm(id: string) {
    const response = await catalogClient.delete(`/films/${id}`);
    return response.data;
}
