export type Genre = typeof GENRES[number];

export const GENRES = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Disaster", "Documentary", "Drama", "Family",
    "Fantasy", "Noir", "History", "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi", "Sport", "Spy",
    "Thriller", "War", "Western"
];

export function isGenre(value: string): value is Genre {
    return (GENRES as readonly string[]).includes(value);
}