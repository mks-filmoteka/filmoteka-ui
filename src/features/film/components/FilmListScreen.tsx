import {useEffect} from "react";
import type {FilmBasic} from "../types/filmBasic.ts";
import type {Page} from "../types/page.ts";
import type {FilmListSearchState} from "../queries/useFilmListSearchState.ts";
import {FilmList} from "./FilmList.tsx";

type FilmSelectionProps = {
    onSave?: () => void;
    onCancel?: () => void;
    saveDisabled?: boolean;
    cancelDisabled?: boolean;
    selectedFilmIds?: ReadonlySet<number>;
    onFilmCheckedChange?: (filmId: number, checked: boolean) => void;
    selectionDisabled?: boolean;
};

type Props = FilmSelectionProps & {
    filmsData?: Page<FilmBasic>;
    search: FilmListSearchState;
};

export function FilmListScreen(props: Readonly<Props>) {
    const {
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
    const totalPages = filmsData?.totalPages ?? 0;
    const pageSize = filmsData?.size ?? 1;
    const page = Math.min(Math.max(pageParam, 1), Math.max(totalPages, 1));

    useEffect(() => {
        if (filmsData && totalPages > 0 && pageParam > totalPages) {
            setPage(totalPages);
        }
    }, [filmsData, pageParam, setPage, totalPages]);

    return (
        <FilmList
            films={filmsData?.content ?? []}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            setPage={setPage}
            view={search.view}
            setView={search.setView}
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
            sortParams={search.sortParams}
            setSort={search.setSort}
            onSave={onSave}
            onCancel={onCancel}
            saveDisabled={saveDisabled}
            cancelDisabled={cancelDisabled}
            selectedFilmIds={selectedFilmIds}
            onFilmCheckedChange={onFilmCheckedChange}
            selectionDisabled={selectionDisabled}
        />
    );
}
