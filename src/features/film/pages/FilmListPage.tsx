import {useFilmsQuery} from "../queries/useFilmsQuery.ts";
import FilmCard from "../components/FilmCard.tsx";
import FilmListItem from "../components/FilmListItem";
import {usePagination} from "../queries/usePagination.ts";
import {useEffect, useState} from "react";
import {useFilmSearchParams} from "../queries/useFilmSearchParams";
import {FilterPopup} from "../components/FilterPopup.tsx";

function FilmListPage() {
    /* URL STATE */
    const {
        title, pageParam, view, yearFrom, yearTo, genres, countries,
        setPage, setView, setGenres, setYearFrom, setYearTo, resetYears, setCountries
    } = useFilmSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);

    /* FETCH DATA */
    const apiYearFrom = yearFrom && yearTo ? Math.min(yearFrom, yearTo) : yearFrom;
    const apiYearTo = yearFrom && yearTo ? Math.max(yearFrom, yearTo) : yearTo;
    const {data, isLoading, error} = useFilmsQuery(pageParam - 1, title, apiYearFrom, apiYearTo, genres, countries);
    const totalPages = data?.totalPages ?? 0;
    const pageSize = data?.size ?? 1;
    const page = Math.min(Math.max(pageParam, 1), Math.max(totalPages, 1));

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

    /* URL PAGE CORRECTION */
    useEffect(() => {
        if (!data || totalPages === 0) return;
        if (pageParam > totalPages) {
            setPage(totalPages);
        }
    }, [data, pageParam, setPage, totalPages]);

    /* UI STATES */
    if (isLoading) {
        return <h1>Loading...</h1>;
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

            {/* FILTER POPUP */}
            <FilterPopup
                filterOpen={filterOpen}
                setFilterOpen={setFilterOpen}
                genres={genres}
                setGenres={setGenres}
                countries={countries}
                setCountries={setCountries}
                yearFrom={yearFrom}
                yearTo={yearTo}
                setYearFrom={setYearFrom}
                setYearTo={setYearTo}
                resetYears={resetYears}
            />

            <div className="navigation navigation-top">

                {/* FILTRATION */}
                <button
                    onClick={() => setFilterOpen(prev => !prev)}
                    title="Filters"
                    className={filterOpen ? "active" : ""}
                    style={{marginRight: "auto"}}
                >
                    ⚶
                </button>

                {/* VIEW */}
                <button
                    onClick={() => setView("list")}
                    title="List view"
                    className={view === "list" ? "active" : ""}
                >
                    ☰
                </button>

                <button
                    onClick={() => setView("grid")}
                    title="Grid view"
                    className={view === "grid" ? "active" : ""}
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