import type {Film} from "../types/film.ts";
import type {FilmRequest} from "../types/filmRequest.ts";

export function fillForm(data?: Film): FilmRequest {
    return {
        title: data?.title ?? "",
        releaseYear: data?.releaseYear ?? 0,
        countries: data?.countries ?? [],
        description: data?.description ?? "",
        posterName: data?.posterName ?? "",
        genres: data?.genres ?? [],
        actors: data?.actors.map(a => ({ name: a.name })) ?? [],
        directors: data?.directors.map(d => ({ name: d.name })) ?? []
    };
}

export function fillRequest(form: FilmRequest): FilmRequest {
    return {
        title: form.title.trim(),
        releaseYear: form.releaseYear,
        countries: Array.from(new Set(form.countries)),
        description: form.description.trim(),
        posterName: form.posterName.trim(),
        genres: Array.from(new Set(form.genres)),
        actors: form.actors
            .filter(a => a.name.trim())
            .map(a => ({
                name: a.name.trim()
            })),
        directors: form.directors
            .filter(d => d.name.trim())
            .map(d => ({
                name: d.name.trim()
            }))
    };
}

export function isFormChanged(form: FilmRequest, data?: Film) {
    return data ? JSON.stringify(form) !== JSON.stringify({
        title: data.title,
        releaseYear: data.releaseYear,
        countries: data.countries,
        description: data.description,
        posterName: data.posterName,
        genres: data.genres,
        actors: data.actors.map(a => ({name: a.name})),
        directors: data.directors.map(d => ({name: d.name}))
    }) : false;
}