import {useState} from "react";
import type {FilmFilter} from "../types/filmFilter.ts";
import {useFilmSearchParams} from "./useFilmSearchParams";

function toApiParam(value: string) {
    return value.replaceAll(" ", "_").replaceAll("-", "_").toUpperCase();
}

export function useFilmApiParams() {
    const [filterOpen, setFilterOpen] = useState(false);
    const {
        title,
        pageParam,
        view,
        yearFrom,
        yearTo,
        minYear,
        maxYear,
        genres,
        countries,
        sort,
        sortParams,
        setPage, setView, setGenres, setYearFrom, setYearTo, resetYears, setCountries, setSort
    } = useFilmSearchParams(true);

    const filmFilter: FilmFilter = {
        page: pageParam - 1,
        title,
        yearFrom: minYear,
        yearTo: maxYear,
        genres: genres.map(toApiParam),
        countries: countries.map(toApiParam),
        sort
    };

    return {
        filmFilter,
        pageParam,
        view,
        yearFrom,
        yearTo,
        genres,
        countries,
        sortParams,
        filterOpen,
        setPage,
        setView,
        setGenres,
        setYearFrom,
        setYearTo,
        resetYears,
        setCountries,
        setSort,
        setFilterOpen
    };
}
