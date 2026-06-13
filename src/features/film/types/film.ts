export interface Film {
    id: number;
    title: string;
    releaseYear: number;
    country: string;
    description: string;
    posterUrl: string;
    genres: string[];
    actors: { id: number; name: string }[];
    directors: { id: number; name: string }[];
}