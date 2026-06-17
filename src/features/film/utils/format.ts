export function formatGenre(genre: string) {
    return genre
        .toLowerCase()
        .replaceAll("_", "-")
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );
}