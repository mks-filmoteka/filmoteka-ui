export function formatParam(param: string) {
    return param
        .toLowerCase()
        .replaceAll("_", "-")
        .replaceAll(
            /\b\w/g,
            char => char.toUpperCase()
        );
}