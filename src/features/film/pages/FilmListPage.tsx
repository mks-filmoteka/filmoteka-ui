import {useFilmsQuery} from "../queries/useFilmsQuery.ts";
import {useEffect, useState} from "react";
import {useFilmSearchParams} from "../queries/useFilmSearchParams";
import {FilmList} from "../components/FilmList.tsx";
import {useIsAdmin} from "../../../shared/auth/useAuth.ts";
import type {FilmRequest} from "../types/filmRequest.ts";
import {fillForm, fillRequest} from "../utils/formState.ts";
import {FilmForm} from "../components/FilmForm.tsx";
import {useCreateFilm} from "../queries/useCreateFilm.ts";
import type {AxiosError} from "axios";
import type {ApiError} from "../../../shared/types/ApiError.ts";

function FilmListPage() {
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
    const [filterOpen, setFilterOpen] = useState(false);
    const isAdmin = useIsAdmin();
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<FilmRequest>(fillForm());
    const createFilm = useCreateFilm();
    const [apiError, setApiError] = useState<ApiError | Error>();

    const handleSave = () => {
        if (!confirm("Confirm create film?")) return;
        createFilm.mutate(
            {request: fillRequest(form)},
            {
                onSuccess: () => setIsCreating(false),
                onError: (error: Error) => {
                    const err = error as AxiosError<ApiError>;
                    setApiError(err.response?.data ?? error);
                }
            }
        );
    };

    /* FETCH DATA */
    const {data, isLoading, error}
        = useFilmsQuery(pageParam - 1, title, minYear, maxYear, genres, countries, sort);
    const totalPages = data?.totalPages ?? 0;
    const pageSize = data?.size ?? 1;
    const page = Math.min(Math.max(pageParam, 1), Math.max(totalPages, 1));

    const pageTitle = (
        <div className="page-title">
            <h1>Films</h1>
            <div>
                <div></div>
                <div className="page-title-controls">
                    {isAdmin && (
                        <button
                            title="Add new film"
                            onClick={() => {
                                setIsCreating(true);
                                setForm(fillForm());
                            }}
                        >
                            ✚
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

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
        <>
            {isCreating ? (
                <FilmForm
                    form={form}
                    setForm={setForm}
                    onSave={handleSave}
                    onCancel={() => {
                        setIsCreating(false);
                        setForm(fillForm());
                        setApiError(undefined);
                    }}
                    isPending={createFilm.isPending}
                    apiError={apiError}
                />
            ) : (
                <FilmList
                    films={data?.content ?? []}
                    pageTitle={pageTitle}
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
                />
            )}
        </>
    );
}

export default FilmListPage;