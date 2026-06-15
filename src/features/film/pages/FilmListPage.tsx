import { useFilmsQuery } from "../queries/useFilmsQuery.ts";
import { useState } from "react";
import  FilmCard  from "../components/FilmCard.tsx";
import FilmListItem from "../components/FilmListItem";
import {usePagination} from "../queries/usePagination.ts";

function FilmListPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading, error } = useFilmsQuery(page);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const totalPages = data?.totalPages ?? 0;
    const pageSize = data?.size ?? 1;
    const {pages, firstPage, previousPage, nextPage, lastPage, canGoBack, canGoForward} =
        usePagination({page, totalPages, onPageChange: setPage});

    console.log("films:", data);

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
                        onClick={() => setViewMode("list")}
                        title="List view"
                        className={viewMode === "list" ? "active" : ""}
                        style={{fontSize: "22px"}}
                    >
                        ☰
                    </button>

                    <button
                        onClick={() => setViewMode("grid")}
                        title="Grid view"
                        className={viewMode === "grid" ? "active" : ""}
                        style={{fontSize: "22px"}}
                    >
                        ▦
                    </button>
                </div>

            {/* MAIN GRID */}
            {viewMode === "list" ? (
                <div style={{display: "flex", justifyContent: "center"}}>
                    <div className="item-list">
                        {data?.content.map((film, index) => (
                            <FilmListItem key={film.id} film={film} index={index+page*pageSize}/>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="card-grid">
                    {data?.content.map((film, index) => (
                        <FilmCard key={film.id} film={film} index={index+page*pageSize}/>
                    ))}
                </div>
            )}

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