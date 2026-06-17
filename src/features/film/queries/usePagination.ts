export function usePagination(
    {
        page, totalPages, max = 7, onPageChange,
    }: {
        page: number; totalPages: number; max?: number; onPageChange: (page: number) => void;
    }
) {
    const half = Math.floor(max / 2);

    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, page + half);

    if (end - start < max - 1) {
        if (start === 0) {
            end = Math.min(totalPages, max - 1);
        } else {
            start = Math.max(1, totalPages - max);
        }
    }

    const pages = Array.from(
        {length: end - start + 1},
        (_, i) => start + i
    );

    return {
        pages,
        firstPage: () => onPageChange(1),
        previousPage: () => onPageChange(Math.max(page - 1, 1)),
        nextPage: () => onPageChange(Math.min(page + 1, totalPages)),
        lastPage: () => onPageChange(totalPages),
        canGoBack: page > 1,
        canGoForward: page < totalPages,
    };
}