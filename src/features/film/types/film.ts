import type {PersonBasic} from "../../person/types/personBasic.ts";
import type {Genre} from "./genre.ts";
import type {Country} from "./country.ts";

export interface Film {
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