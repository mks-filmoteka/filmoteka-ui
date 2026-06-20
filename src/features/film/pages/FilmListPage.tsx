import {useFilmsQuery} from "../queries/useFilmsQuery.ts";
import FilmCard from "../components/FilmCard.tsx";
import FilmListItem from "../components/FilmListItem";
import {usePagination} from "../queries/usePagination.ts";
import {useEffect, useRef, useState} from "react";
import {useFilmSearchParams} from "../queries/useFilmSearchParams";
import {COUNTRIES, GENRES, MAX_YEAR, MIN_YEAR, YEARS} from "../constants/constants.ts";
import {formatGenre} from "../utils/format.ts";

function FilmListPage() {
    /* URL STATE */
    const {
        title, pageParam, view, yearFrom, yearTo, genres, countries,
        setPage, setView, setGenres, setYearFrom, setYearTo, resetYears, setCountries
    } = useFilmSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);
    const [yearFromOpen, setYearFromOpen] = useState(false);
    const [yearToOpen, setYearToOpen] = useState(false);
    const [yearFromInput, setYearFromInput] = useState("");
    const [yearToInput, setYearToInput] = useState("");

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

    const toggleGenre = (genre: string) => {
        if (genres.includes(genre)) {
            setGenres(genres.filter(g => g !== genre));
        } else {
            setGenres([...genres, genre]);
        }
    };

    const toggleCountry = (country: string) => {
        if (countries.includes(country)) {
            setCountries(countries.filter(c => c !== country));
        } else {
            setCountries([...countries, country]);
        }
    };

    const yearDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (yearFromOpen && yearDropdownRef.current) {
            const index = YEARS.indexOf(yearFrom ?? 2000);
            yearDropdownRef.current.scrollTop = index * 19;
        }
        if (yearToOpen && yearDropdownRef.current) {
            const index = YEARS.indexOf(yearTo ?? 2000);
            yearDropdownRef.current.scrollTop = index * 19;
        }
    }, [yearFromOpen, yearFrom, yearToOpen, yearTo]);

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
            {filterOpen && (
                <div
                    className="filter-overlay"
                    onClick={() => {
                        setFilterOpen(false)
                        setYearFromOpen(false);
                        setYearToOpen(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setFilterOpen(false);
                            setYearFromOpen(false);
                            setYearToOpen(false);
                        }
                    }}
                    role="presentation"
                >
                    <div
                        className="filter-popup"
                        onClick={(e) => {
                            e.stopPropagation()
                            setYearFromOpen(false);
                            setYearToOpen(false);
                        }}
                    >
                        {/* GENRE FILTER SECTION */}
                        <div className="filter-options">
                            <div className="filter-section-header">
                                <span>Genres:</span>
                                <button onClick={() => setGenres([])}>
                                    ↺
                                </button>
                            </div>
                            {GENRES.map(genre => (
                                <button
                                    key={genre}
                                    className={`filter-options-button ${genres.includes(genre) ? "active" : ""}`}
                                    onClick={() => toggleGenre(genre)}
                                >
                                    {formatGenre(genre)}
                                </button>
                            ))}
                        </div>

                        <hr/>

                        {/* RELEASE YEAR FILTER SECTION */}
                        <div className="filter-options">
                            <div className="filter-section-header">
                                <span>Release year:</span>
                                <button onClick={() => {
                                    resetYears();
                                    setYearFromInput("");
                                    setYearToInput("");
                                }}>
                                    ↺
                                </button>
                            </div>

                            {/* YEAR FROM */}
                            <div className="filter-year-picker">
                                <input
                                    value={yearFromInput}
                                    placeholder="From"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setYearFromOpen(o => !o);
                                    }}
                                    onChange={(e) =>
                                        setYearFromInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const num = Number(yearFromInput);
                                            if (Number.isFinite(num) && num >= MIN_YEAR && num <= MAX_YEAR) {
                                                setYearFrom(num);
                                            } else {
                                                setYearFrom();
                                                setYearFromInput("");
                                            }
                                            setYearFromOpen(false);
                                        }
                                    }}
                                />
                                {(yearFrom !== undefined || yearFromInput !== "") && (
                                    <button
                                        className="input-clear"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setYearFrom();
                                            setYearFromInput("");
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                                {yearFromOpen && (
                                    <div
                                        ref={yearDropdownRef}
                                        className="filter-year-dropdown"
                                    >
                                        {YEARS.map(y => (
                                            <div key={y} onClick={() => {
                                                setYearFrom(y);
                                                setYearFromInput(String(y));
                                                setYearFromOpen(false);
                                            }}>
                                                {y}
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>

                            <span> — </span>

                            {/* YEAR TO */}
                            <div className="filter-year-picker">
                                <input
                                    value={yearToInput}
                                    placeholder="To"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setYearToOpen(o => !o);
                                    }}
                                    onChange={(e) =>
                                        setYearToInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const num = Number(yearToInput);
                                            if (Number.isFinite(num) && num >= MIN_YEAR && num <= MAX_YEAR) {
                                                setYearTo(num);
                                            } else {
                                                setYearTo();
                                                setYearToInput("")
                                            }
                                            setYearToOpen(false);
                                        }
                                    }}
                                />
                                {(yearTo !== undefined || yearToInput !== "") && (
                                    <button
                                        className="input-clear"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setYearTo();
                                            setYearToInput("");
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                                {yearToOpen && (
                                    <div
                                        ref={yearDropdownRef}
                                        className="filter-year-dropdown"
                                    >
                                        {YEARS.map(y => (
                                            <div key={y} onClick={() => {
                                                setYearTo(y);
                                                setYearToInput(String(y));
                                                setYearToOpen(false);
                                            }}>
                                                {y}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr/>

                        {/* COUNTRY FILTER SECTION */}
                        <div className="filter-options">
                            <div className="filter-section-header">
                                <span>Countries:</span>
                                <button onClick={() => setCountries([])}>
                                    ↺
                                </button>
                            </div>
                            {COUNTRIES.map(country => (
                                <button
                                    key={country}
                                    className={`filter-options-button ${countries.includes(country) ? "active" : ""}`}
                                    onClick={() => toggleCountry(country)}
                                >
                                    {country}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>
            )}

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