export type Genre = typeof GENRES[number];

export const GENRES = [
    "ACTION", "ADVENTURE", "ANIMATION", "BIOGRAPHY", "COMEDY", "CRIME", "DOCUMENTARY", "DRAMA", "FAMILY", "FANTASY",
    "NOIR", "HISTORY", "HORROR", "MUSIC", "MUSICAL", "ROMANCE", "SCI_FI", "SPORT", "THRILLER", "WAR", "WESTERN"];

export function isGenre(value: string): value is Genre {
    return (GENRES as readonly string[]).includes(value);
}