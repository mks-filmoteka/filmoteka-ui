type Props = {
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
};

export function Pagination(props: Readonly<Props>) {
    const {page, totalPages, setPage} = props;

    const half = Math.floor(7 / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + 6);
    start = Math.max(1, end - 6);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const firstPage = () => setPage(1);
    const previousPage = () => setPage(Math.max(page - 1, 1));
    const nextPage = () => setPage(Math.min(page + 1, totalPages));
    const lastPage = () => setPage(totalPages);
    const canGoBack = page > 1;
    const canGoForward = page < totalPages;

    if (totalPages <= 1) return null;

    return (
        <div className="navigation">
            <button onClick={firstPage} title="First page">
                ❚❰
            </button>
            <button
                onClick={previousPage}
                disabled={!canGoBack}
                style={{marginRight: "10px"}}
            >
                ❰
            </button>
            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={p === page ? "active" : ""}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={nextPage}
                disabled={!canGoForward}
                style={{marginLeft: "10px"}}
            >
                ❱
            </button>
            <button
                onClick={lastPage}
                title={`Last page: ${totalPages}`}
            >
                ❱❚
            </button>
        </div>
    );
}