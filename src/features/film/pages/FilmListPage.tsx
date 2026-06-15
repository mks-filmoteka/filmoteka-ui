import { useFilmsQuery } from "../queries/useFilmsQuery.ts";
import  FilmCard  from "../components/FilmCard.tsx";
import FilmListItem from "../components/FilmListItem";
import { usePagination } from "../queries/usePagination.ts";
import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect } from "react";

function FilmListPage() {
    /* URL STATE */
    const [searchParams, setSearchParams] = useSearchParams();
    const updateParam = useCallback((key: string, value: string) => {
            setSearchParams(prev => {
                const params = new URLSearchParams(prev);
                params.set(key, value);
                return params;
            });
        }, [setSearchParams]
    );
    const title = searchParams.get("title") ?? "";
    const view = searchParams.get("view") ?? "list";
    const pageRaw = Number(searchParams.get("page") ?? 1);

    /* FETCH DATA */
    const { data, isLoading, error } = useFilmsQuery(pageRaw-1, title);
    const totalPages = data?.totalPages ?? 0;
    const pageSize = data?.size ?? 1;
    const page = Math.min(Math.max(pageRaw-1, 0), Math.max(totalPages - 1, 0));

    let filmsContent;

    if (!data || data.content.length === 0) {
        filmsContent = <h1>No films found</h1>;
    } else if (view === "list") {
        filmsContent = (
            <div className="item-list">
                {data.content.map((film, index) => (
                    <FilmListItem key={film.id} film={film} index={index + page * pageSize}/>
                ))}
            </div>
        );
    } else {
        filmsContent = (
            <div className="card-grid">
                {data.content.map((film, index) => (
                    <FilmCard key={film.id} film={film} index={index + page * pageSize}/>
                ))}
            </div>
        );
    }


    /* ACTIONS*/
    const setPage = (newPage: number) => {
        updateParam("page", String(newPage+1))
    };
    const setView = (newView: string) => {
        updateParam("view", newView);
    };
    const {pages, firstPage, previousPage, nextPage, lastPage, canGoBack, canGoForward} =
        usePagination({page, totalPages, onPageChange: setPage});

    /* URL PAGE CORRECTION */
    useEffect(() => {
        if (!data || totalPages === 0) return;
        if (pageRaw > totalPages) {updateParam("page", String(totalPages));}
        if (pageRaw < 1) {updateParam("page", "1");}
    }, [data, pageRaw, totalPages, updateParam]);

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
                <div className="navigation" style={{justifyContent: "flex-end" }}>
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
            <div className="navigation">
                <button onClick={firstPage} title="First page">
                    ❚❰
                </button>
                <button onClick={previousPage} disabled={!canGoBack} style={{marginRight: "10px"}}>
                    ❰
                </button>
                {pages.map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={p === page ? "active" : ""}>
                        {p + 1}
                    </button>
                ))}
                <button onClick={nextPage} disabled={!canGoForward} style={{marginLeft: "10px"}}>
                    ❱
                </button>
                <button onClick={lastPage} title={`Last page:  ${totalPages}`}>
                    ❱❚
                </button>
            </div>
        </div>
    );
}

export default FilmListPage;