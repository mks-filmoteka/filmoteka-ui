import {usePagination} from "../queries/usePagination.ts";

type Props = {
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
};


export function Pagination(props: Readonly<Props>) {
    const {page, totalPages, setPage} = props;

    const {firstPage, previousPage, nextPage, lastPage, canGoBack, canGoForward} =
        usePagination({page, totalPages, onPageChange: setPage});

    if (totalPages <= 1) return null;

    const pages = Array.from({length: totalPages}, (_, i) => i + 1);

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