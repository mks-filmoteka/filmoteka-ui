import type { Film } from "../features/film/types/film.ts";
import type { FilmBasic } from "../features/film/types/filmBasic.ts";
import type { Person } from "../features/person/types/person.ts";

export function testFilm(overrides: Partial<Film> = {}): Film {
    return {
        version: 0,
        id: 1,
        title: "Test Title",
        releaseYear: 2000,
        countries: ["Poland"],
        description: "Test description",
        posterName: null,
        genres: ["Drama"],
        actors: [{ id: 1, name: "Test Actor" }],
        directors: [{ id: 2, name: "Test Director" }],
        ...overrides,
    };
}

export function testFilmBasic(overrides: Partial<FilmBasic> = {}): FilmBasic {
    return {
        id: 1,
        title: "Test Film",
        releaseYear: 2000,
        countries: ["Poland"],
        posterName: null,
        genres: ["Drama"],
        ...overrides,
    };
}

export function testPerson(overrides: Partial<Person> = {}): Person {
    return {
        id: 1,
        name: "Test Person",
        birthDate: null,
        deathDate: null,
        placeOfBirth: null,
        photoName: null,
        actingFilms: [],
        directingFilms: [],
        ...overrides,
    };
}
