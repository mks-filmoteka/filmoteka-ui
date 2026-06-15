export function usePagination(
    {
        page,
        totalPages,
        max = 7,
        onPageChange,
    }: {
        page: number;
        totalPages: number;
        max?: number;
        onPageChange: (page: number) => void;
    }
) {
    const half = Math.floor(max / 2);

    let start = Math.max(0, page - half);
    let end = Math.min(totalPages - 1, page + half);

    if (end - start < max - 1) {
        if (start === 0) {
            end = Math.min(totalPages - 1, max - 1);
        } else {
            start = Math.max(0, totalPages - max);
        }
    }

    const pages = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
    );


    return {
        pages,
        firstPage: () => onPageChange(0),
        previousPage: () => onPageChange(Math.max(page - 1, 0)),
        nextPage: () => onPageChange(Math.min(page + 1, totalPages - 1)),
        lastPage: () => onPageChange(totalPages - 1),
        canGoBack: page > 0,
        canGoForward: page < totalPages - 1,
    };
}