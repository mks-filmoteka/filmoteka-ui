import type {FilmBasic} from "../../film/types/filmBasic.ts";

export interface Person {
    id: number;
    name: string;
    films: FilmBasic[];
}