import {useEffect, type Dispatch, type SetStateAction} from "react";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Page} from "../types/page.ts";
import {FilmGallery} from "./FilmGallery.tsx";
import {FilterPopup} from "./FilterPopup.tsx";
import {ListToolbar} from "./ListToolbar.tsx";
import {Pagination} from "./Pagination.tsx";

type SortParam = {
    by?: string;
    dir?: string;
};

export type FilmBrowserSearchState = {
    pageParam: number;
    view: string;
    yearFrom?: number;
    yearTo?: number;
    genres: string[];
    countries: string[];
    sortParams: SortParam[];
    filterOpen: boolean;
    setPage: (page: number) => void;
    setView: (view: string) => void;
    setGenres: (genres: string[]) => void;
    setYearFrom: (year?: number) => void;
    setYearTo: (year?: number) => void;
    resetYears: () => void;
    setCountries: (countries: string[]) => void;
    setSort: (sort: SortParam[]) => void;
    setFilterOpen: Dispatch<SetStateAction<boolean>>;
};

type FilmBrowserSelectionProps = {
    onSave?: () => void;
    onCancel?: () => void;
    saveDisabled?: boolean;
    cancelDisabled?: boolean;
    selectedFilmIds?: ReadonlySet<number>;
    onFilmCheckedChange?: (filmId: number, checked: boolean) => void;
    selectionDisabled?: boolean;
};

type Props = FilmBrowserSelectionProps & {
    films?: FilmBasic[];
    filmsData?: Page<FilmBasic>;
    search: FilmBrowserSearchState;
};

export function FilmBrowser(props: Readonly<Props>) {
    const {
        films: localFilms,
        filmsData,
        search,
        onSave,
        onCancel,
        saveDisabled,
        cancelDisabled,
        selectedFilmIds,
        onFilmCheckedChange,
        selectionDisabled
    } = props;
    const {pageParam, setPage} = search;
    const films = filmsData?.content ?? localFilms ?? [];
    const totalPages = filmsData?.totalPages ?? 1;
    const pageSize = filmsData?.size ?? Math.max(films.length, 1);
    const page = filmsData
        ? Math.min(Math.max(pageParam, 1), Math.max(totalPages, 1))
        : 1;
    const startIndex = filmsData ? (page - 1) * pageSize : 0;

    useEffect(() => {
        if (filmsData && totalPages > 0 && pageParam > totalPages) {
            setPage(totalPages);
        }
    }, [filmsData, pageParam, setPage, totalPages]);

    return (
        <>
            <ListToolbar
                filterOpen={search.filterOpen}
                setFilterOpen={search.setFilterOpen}
                sortParams={search.sortParams}
                setSort={search.setSort}
                view={search.view}
                setView={search.setView}
                onSave={onSave}
                onCancel={onCancel}
                saveDisabled={saveDisabled}
                cancelDisabled={cancelDisabled}
            />

            <FilterPopup
                filterOpen={search.filterOpen}
                setFilterOpen={search.setFilterOpen}
                genres={search.genres}
                setGenres={search.setGenres}
                countries={search.countries}
                setCountries={search.setCountries}
                yearFrom={search.yearFrom}
                yearTo={search.yearTo}
                setYearFrom={search.setYearFrom}
                setYearTo={search.setYearTo}
                resetYears={search.resetYears}
            />

            <FilmGallery
                films={films}
                view={search.view}
                startIndex={startIndex}
                selectedFilmIds={selectedFilmIds}
                onFilmCheckedChange={onFilmCheckedChange}
                selectionDisabled={selectionDisabled}
            />

            <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
            />
        </>
    );
}
