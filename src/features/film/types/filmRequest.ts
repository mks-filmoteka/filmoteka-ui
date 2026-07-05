import type {PersonRequest} from "../../person/types/personRequest.ts";
import type {Country} from "./country.ts";
import type {Genre} from "./genre.ts";

export interface FilmRequest {
    title: string;
    releaseYear: number;
    countries: Country[];
    description: string;
    posterName?: string | null;
    genres: Genre[];
    actors: PersonRequest[];
    directors: PersonRequest[];
}