import type {FilmBasic} from "../types/filmBasic.ts";
import FilmListItem from "./FilmListItem.tsx";
import FilmCard from "./FilmCard.tsx";
import {FilterPopup} from "./FilterPopup.tsx";
import {ListToolbar} from "./ListToolbar.tsx";
import {Pagination} from "./Pagination.tsx";
import * as React from "react";

type Props = {
    films: FilmBasic[];
    pageTitle: React.JSX.Element;
    page: number;
    totalPages: number;
    pageSize: number;
    setPage: (page: number) => void;
    view: string;
    setView: (view: string) => void;
    filterOpen: boolean;
    setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
    genres: string[];
    setGenres: (genres: string[]) => void;
    countries: string[];
    setCountries: (countries: string[]) => void;
    yearFrom?: number;
    yearTo?: number;
    setYearFrom: (year?: number) => void;
    setYearTo: (year?: number) => void;
    resetYears: () => void;
    sortParams: { by?: string, dir?: string }[];
    setSort: (sort: { by?: string; dir?: string; }[]) => void
};

export function FilmList(props: Readonly<Props>) {
    const {
        films,
        pageTitle,
        page,
        totalPages,
        pageSize,
        view,
        filterOpen,
        genres,
        countries,
        yearFrom,
        yearTo,
        sortParams,
        setPage,
        setView,
        setFilterOpen,
        setGenres,
        setCountries,
        setYearFrom,
        setYearTo,
        resetYears,
        setSort
    } = props;

    const {ItemComponent, containerClass} = view === "list"
        ? {ItemComponent: FilmListItem, containerClass: "item-list"}
        : {ItemComponent: FilmCard, containerClass: "card-grid"};

    let filmsContent;
    if (films.length === 0) {
        filmsContent = <h1>No films found</h1>;
    } else {
        filmsContent = (
            <div className={containerClass}>
                {films.map((film, index) => (
                    <ItemComponent key={film.id} film={film} index={index + (page - 1) * pageSize}/>
                ))}
            </div>
        );
    }

    return (
        <div>
            {pageTitle}
            <hr/>

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