import type { PersonBasic } from "../../person/types/personBasic.ts";
import type { Genre } from "./genre.ts";
import type { Country } from "./country.ts";

export interface Film {
    version: number;
    id: number;
    title: string;
    releaseYear: number;
    countries: Country[];
    description: string;
    posterName?: string | null;
    genres: Genre[];
    actors: PersonBasic[];
    directors: PersonBasic[];
}
