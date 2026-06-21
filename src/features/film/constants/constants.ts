export const GENRES = [
    "ACTION", "ADVENTURE", "ANIMATION", "BIOGRAPHY", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FAMILY", "FANTASY",
    "NOIR", "HISTORY", "HORROR", "MUSIC", "MUSICAL", "ROMANCE", "SCI_FI", "SPORT", "THRILLER", "WAR", "WESTERN"];

export const MIN_YEAR = 1888;

export const MAX_YEAR = 2100;

export const YEARS =
    Array.from({length: MAX_YEAR - MIN_YEAR + 1}, (_, i) => MIN_YEAR + i);

export const COUNTRIES = [
    "USA", "United Kingdom", "France", "Germany", "Italy", "Spain", "Japan", "South Korea",
    "China", "India", "Canada", "Australia", "New Zealand"];

export const SORT_BY = ["title", "releaseYear"];
export const SORT_DIR = ["asc", "desc"];
