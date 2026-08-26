import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {useAuth} from "../../../auth/useAuth.ts";
import {FilmFormController} from "../components/FilmFormController.tsx";
import {FilmList} from "../components/FilmList.tsx";
import {FilmListPageTitle} from "../components/FilmListPageTitle.tsx";
import {useCreateFilm} from "../queries/useCreateFilm.ts";
import {useFilmListData} from "../queries/useFilmListData.ts";
import {useFilmSearchParams} from "../queries/useFilmSearchParams";

type Props = {
    source?: "films" | "collection";
};

function toApiParam(p: string) {
    return p.replaceAll(" ", "_").replaceAll("-", "_").toUpperCase();
}

function FilmListPage({source = "films"}: Readonly<Props>) {
    const isCollection = source === "collection";
    const {id} = useParams();
    const isAdmin = useAuth().isAdmin;
    const [filterOpen, setFilterOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const createFilm = useCreateFilm();

    /* URL STATE */
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

    const filmFilter = {
        page: pageParam - 1,
        title,
        yearFrom: minYear,
        yearTo: maxYear,
        genres: genres.map(toApiParam),
        countries: countries.map(toApiParam),
        sort
    };
    const {
        selectedCollectionQuery,
        activeFilmsQuery,
        collection,
        collectionFilmEditor,
        isEditingCollectionFilms,
        collectionEditingProps
    } = useFilmListData({
        collectionId: id,
        filmFilter,
        isCollection
    });

    const data = activeFilmsQuery.data;
    const totalPages = data?.totalPages ?? 0;
    const pageSize = data?.size ?? 1;
    const page = Math.min(Math.max(pageParam, 1), Math.max(totalPages, 1));
    const showCreateForm = !isCollection && isAdmin && isCreating;

    /* URL PAGE CORRECTION */
    useEffect(() => {
        if (data && totalPages > 0 && pageParam > totalPages) {
            setPage(totalPages);
        }
    }, [data, pageParam, setPage, totalPages]);

    /* UI STATES */
    if (selectedCollectionQuery.isLoading || activeFilmsQuery.isLoading) {
        return <h1>Loading...</h1>;
    }
    if (selectedCollectionQuery.error) {
        return <h1>Error loading collection: {selectedCollectionQuery.error.message}</h1>;
    }
    if (activeFilmsQuery.error) {
        return <h1>Error loading films: {activeFilmsQuery.error.message}</h1>;
    }
    if (showCreateForm) {
        return (
            <FilmFormController
                confirmMessage="Confirm create film?"
                isPending={createFilm.isPending}
                onCancel={() => setIsCreating(false)}
                onSave={(request, options) => createFilm.mutate({request}, options)}
            />
        );
    }

    return (
        <FilmList
            films={data?.content ?? []}
            pageTitle={(
                <FilmListPageTitle
                    source={source}
                    collection={collection}
                    isAdmin={isAdmin}
                    isEditingCollectionFilms={isEditingCollectionFilms}
                    onAddFilmsToCollection={collectionFilmEditor.startEditing}
                    onCreateFilm={() => setIsCreating(true)}
                />
            )}
            page={page}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 0}
            setPage={setPage}
            view={view}
            setView={setView}
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
            sortParams={sortParams}
            setSort={setSort}
            {...collectionEditingProps}
        />
    );
}

export default FilmListPage;
