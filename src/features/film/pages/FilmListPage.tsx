import {useFilmsQuery} from "../queries/useFilmsQuery.ts";
import FilmCard from "../components/FilmCard.tsx";
import FilmListItem from "../components/FilmListItem";
import {useEffect, useState} from "react";
import {useFilmSearchParams} from "../queries/useFilmSearchParams";
import {FilterPopup} from "../components/FilterPopup.tsx";
import {ListToolbar} from "../components/ListToolbar.tsx";
import {Pagination} from "../components/Pagination.tsx";

function FilmListPage() {
    /* URL STATE */
    const {
        title,
        pageParam,
        view,
        yearFrom,
        yearTo,
        genres,
        countries,
        sort,
        sortParams,
        setPage, setView, setGenres, setYearFrom, setYearTo, resetYears, setCountries, setSort
    } = useFilmSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);

    /* FETCH DATA */
    const apiYearFrom = yearFrom && yearTo ? Math.min(yearFrom, yearTo) : yearFrom;
    const apiYearTo = yearFrom && yearTo ? Math.max(yearFrom, yearTo) : yearTo;
    const {data, isLoading, error}
        = useFilmsQuery(pageParam - 1, title, apiYearFrom, apiYearTo, genres, countries, sort);
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
            <div className="page-title">
                <h1>Films</h1>
            </div>

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

            {/* LIST TOOLBAR */}
            <ListToolbar
                filterOpen={filterOpen}
                setFilterOpen={setFilterOpen}
                sortParams={sortParams}
                setSort={setSort}
                view={view}
                setView={setView}
            />

            {/* MAIN GRID */}
            <div className="item-list-wrapper">
                {filmsContent}
            </div>

            {/* PAGINATION */}
            <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
            />
        </div>
    );
}

export default FilmListPage;