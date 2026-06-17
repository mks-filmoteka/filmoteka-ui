import {useFilmsQuery} from "../queries/useFilmsQuery.ts";
import FilmCard from "../components/FilmCard.tsx";
import FilmListItem from "../components/FilmListItem";
import {usePagination} from "../queries/usePagination.ts";
import {useEffect} from "react";
import {useFilmSearchParams} from "../queries/useFilmSearchParams";

function FilmListPage() {
    /* URL STATE */
    const {title, pageParam, view, setPage, setView} = useFilmSearchParams();

    /* FETCH DATA */
    const {data, isLoading, error} = useFilmsQuery(pageParam - 1, title);
    const totalPages = data?.totalPages ?? 0;
    const pageSize = data?.size ?? 1;
    const page = Math.min(Math.max(pageParam, 0), Math.max(totalPages, 0));

    let filmsContent;

    if (!data || data.content.length === 0) {
        filmsContent = <h1>No films found</h1>;
    } else if (view === "list") {
        filmsContent = (
            <div className="item-list">
                {data.content.map((film, index) => (
                    <FilmListItem key={film.id} film={film} index={index + (page - 1) * pageSize}/>
                ))}
            </div>
        );
    } else {
        filmsContent = (
            <div className="card-grid">
                {data.content.map((film, index) => (
                    <FilmCard key={film.id} film={film} index={index + (page - 1) * pageSize}/>
                ))}
            </div>
        );
    }

    /* ACTIONS*/
    const {pages, firstPage, previousPage, nextPage, lastPage, canGoBack, canGoForward} =
        usePagination({page, totalPages, onPageChange: setPage});

    /* URL CORRECTION */
    useEffect(() => {
        if (!data || totalPages === 0) return;
        if (pageParam > totalPages) {
            setPage(totalPages);
        }
        if (pageParam < 1) {
            setPage(1);
        }
    }, [data, pageParam, setPage, totalPages]);

    useEffect(() => {
        if (!["list", "grid"].includes(view)) {
            setView("list");
        }
    }, [view, setView]);

    /* UI STATES */
    if (isLoading) {
        return <h1>Loading...</h1>;
    }
    if (!data || data.content.length === 0) {
        return <h1>No films found</h1>
    }
    if (error) {
        return (
            <div>
                <h1>
                    Error loading films
                </h1>
                {error.message}
            </div>
        );
    }

    return (
        <div>
            <h1>Films</h1>

            {/* VIEW MODE */}
            <div className="navigation" style={{justifyContent: "flex-end"}}>
                <button
                    onClick={() => setView("list")}
                    title="List view"
                    className={view === "list" ? "active" : ""}
                    style={{fontSize: "22px", minWidth: "20px"}}
                >
                    ☰
                </button>

                <button
                    onClick={() => setView("grid")}
                    title="Grid view"
                    className={view === "grid" ? "active" : ""}
                    style={{fontSize: "22px", minWidth: "20px"}}
                >
                    ▦
                </button>
            </div>

            {/* MAIN GRID */}
            <div style={{display: "flex", justifyContent: "center"}}>
                {filmsContent}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="navigation">
                    <button onClick={firstPage} title="First page">
                        ❚❰
                    </button>
                    <button onClick={previousPage} disabled={!canGoBack} style={{marginRight: "10px"}}>
                        ❰
                    </button>
                    {pages.map((p) => (
                        <button key={p} onClick={() => setPage(p)} className={p === page ? "active" : ""}>
                            {p}
                        </button>
                    ))}
                    <button onClick={nextPage} disabled={!canGoForward} style={{marginLeft: "10px"}}>
                        ❱
                    </button>
                    <button onClick={lastPage} title={`Last page:  ${totalPages}`}>
                        ❱❚
                    </button>
                </div>
            )}
        </div>
    );
}

export default FilmListPage;