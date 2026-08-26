export interface FilmFilter {
    page: number;
    title?: string;
    yearFrom?: number;
    yearTo?: number;
    genres?: string[];
    countries?: string[];
    sort?: string[];
}

export interface CollectionFilmFilter extends FilmFilter {
    ids: number[];
}
