export interface Person {
    id: number;
    name: string;
    films: {
        id: number;
        title: string;
        releaseYear: number;
        posterUrl: string
    }[];
}