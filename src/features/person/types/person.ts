import type { FilmBasic } from "../../film/types/filmBasic.ts";

export interface Person {
    id: number;
    name: string;
    birthDate: string | null;
    deathDate: string | null;
    placeOfBirth: string | null;
    photoName: string | null;
    actingFilms: FilmBasic[];
    directingFilms: FilmBasic[];
}
