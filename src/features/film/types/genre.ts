export type Genre = typeof GENRES[number];

export const GENRES = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy",
    "Noir", "History", "Horror", "Music", "Musical", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"
];

export function isGenre(value: string): value is Genre {
    return (GENRES as readonly string[]).includes(value);
}