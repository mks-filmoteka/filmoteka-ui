import type {Country} from "./country.ts";
import type {Genre} from "./genre.ts";

export interface FilmBasic {
    id: number;
    title: string;
    releaseYear: number;
    countries: Country[];
    posterUrl: string;
    genres: Genre[];
}