import { useFilmsQuery } from "../queries/useFilmsQuery.ts";
import  FilmCard  from "../components/FilmCard.tsx";
import FilmListItem from "../components/FilmListItem";
import {usePagination} from "../queries/usePagination.ts";
import { useSearchParams } from "react-router-dom";
import {useEffect} from "react";

function FilmListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageRaw = Number(searchParams.get("page") ?? 1);
    const { data, isLoading, error } = useFilmsQuery(pageRaw-1);
    const totalPages = data?.totalPages ?? 0;
    const pageSize = data?.size ?? 1;
    const page = Math.min(Math.max(pageRaw-1, 0), Math.max(totalPages - 1, 0));
    const setPage = (newPage: number) => {
        setSearchParams({page: String(newPage+1), view});
    };
    const view = searchParams.get("view") ?? "list";
    const setView = (newView: string) => {
        setSearchParams({page: "1", view: newView,});
    };
    const {pages, firstPage, previousPage, nextPage, lastPage, canGoBack, canGoForward} =
        usePagination({page, totalPages, onPageChange: setPage});

    console.log("films:", data);

    useEffect(() => {
        if (!data) return;
        if (pageRaw > totalPages) {
            setSearchParams({page: String(totalPages), view,});
        }
        if (pageRaw < 1) {
            setSearchParams({page: "1", view,});
        }
    }, [data, pageRaw, setSearchParams, totalPages, view]);

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
                        style={{fontSize: "22px"}}
                    >
                        ☰
                    </button>

                    <button
                        onClick={() => setView("grid")}
                        title="Grid view"
                        className={view === "grid" ? "active" : ""}
                        style={{fontSize: "22px"}}
                    >
                        ▦
                    </button>
                </div>

            {/* MAIN GRID */}
            <div style={{display: "flex", justifyContent: "center"}}>
                {view === "list" ? (
                    <div className="item-list">
                        {data?.content.map((film, index) => (
                            <FilmListItem key={film.id} film={film} index={index + page * pageSize}/>
                        ))}
                    </div>
                ) : (
                    <div className="card-grid">
                        {data?.content.map((film, index) => (
                            <FilmCard key={film.id} film={film} index={index + page * pageSize}/>
                        ))}
                    </div>
                )}
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