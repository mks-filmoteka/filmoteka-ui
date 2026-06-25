export const MIN_YEAR = 1888;

export const MAX_YEAR = 2100;

export const YEARS =
    Array.from({length: MAX_YEAR - MIN_YEAR + 1}, (_, i) => MIN_YEAR + i);

export const SORT_BY = ["title", "releaseYear"];

export const SORT_DIR = ["asc", "desc"];
