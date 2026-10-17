import { usePerson } from "../queries/usePerson.ts";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PersonDetails } from "../components/PersonDetails.tsx";
import { RoleSwitch, type Role } from "../components/RoleSwitch.tsx";
import { useFilmSearchParams } from "../../film/queries/useFilmSearchParams.ts";
import { FilmBrowser } from "../../film/components/FilmBrowser.tsx";
import type { FilmBasic } from "../../film/types/filmBasic.ts";
import { SORT_BY, SORT_DIR } from "../../film/constants/constants.ts";
import { useAuth } from "../../../auth/useAuth.ts";
import { useDeletePerson } from "../queries/useDeletePerson.ts";
import { PersonEditForm } from "../components/PersonEditForm.tsx";
import { useToast } from "../../../shared/utils/useToast.ts";
import { useRequiredId } from "../../../shared/utils/useRequiredId.ts";
import { getApiError, isNotFoundError } from "../../../shared/api/apiError.ts";
import { ApiErrorMessage } from "../../../shared/components/ApiErrorMessage.tsx";
import { NotFoundMessage } from "../../../shared/components/NotFoundMessage.tsx";
import { IconButton } from "../../../shared/components/IconButton.tsx";
import { useConfirm } from "../../../shared/utils/useConfirm.ts";
import { LoadingIndicator } from "../../../shared/components/LoadingIndicator.tsx";

function PersonPage() {
    const confirm = useConfirm();
    const id = useRequiredId();
    const { data, isLoading, error } = usePerson(id);
    const isAdmin = useAuth().isAdmin;
    const [searchParams, setSearchParams] = useSearchParams();
    const [isEditing, setIsEditing] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const deletePerson = useDeletePerson();
    const handleDelete = async () => {
        if (!(await confirm("Confirm delete person?"))) return;
        deletePerson.mutate(id, {
            onSuccess: () => {
                toast("Person deleted");
                void navigate("/films");
            },
        });
    };
    /* URL STATE */
    const {
        view,
        yearFrom,
        yearTo,
        minYear,
        maxYear,
        genres,
        countries,
        sortParams,
        setView,
        setGenres,
        setYearFrom,
        setYearTo,
        resetYears,
        setCountries,
        setSort,
    } = useFilmSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);

    const filtering = (film: FilmBasic) => {
        if (minYear && film.releaseYear < minYear) return false;
        if (maxYear && film.releaseYear > maxYear) return false;
        if (genres.length && !film.genres.some((g) => genres.includes(g))) return false;
        return !(countries.length && !film.countries.some((country) => countries.includes(country)));
    };
    const sorting = (a: FilmBasic, b: FilmBasic) => {
        let result = 0;
        for (const sort of sortParams) {
            const dir = sort.dir === SORT_DIR[0] ? 1 : -1;
            if (sort.by === SORT_BY[0]) {
                result = a.title.localeCompare(b.title) * dir;
            } else if (sort.by === SORT_BY[1]) {
                result = (a.releaseYear - b.releaseYear) * dir;
            }
            if (result !== 0) return result;
        }
        return a.releaseYear - b.releaseYear;
    };
    const actingFilms = data?.actingFilms ?? [];
    const directingFilms = data?.directingFilms ?? [];
    const role: Role =
        actingFilms.length === 0 || (directingFilms.length > 0 && searchParams.get("role") === "director")
            ? "director"
            : "actor";
    const roles = [actingFilms.length > 0 && "Actor", directingFilms.length > 0 && "Director"]
        .filter(Boolean)
        .join(", ");
    const selectRole = (selected: Role) => {
        setSearchParams(
            (params) => {
                params.set("role", selected);
                return params;
            },
            { replace: true },
        );
    };
    const films = (role === "actor" ? actingFilms : directingFilms).filter(filtering).sort(sorting);

    const browserSearch = {
        pageParam: 1,
        view,
        yearFrom,
        yearTo,
        genres,
        countries,
        sortParams,
        filterOpen,
        setPage: () => {},
        setView,
        setGenres,
        setYearFrom,
        setYearTo,
        resetYears,
        setCountries,
        setSort,
        setFilterOpen,
    };

    const controls = isAdmin && (
        <>
            <IconButton icon="edit" label="Edit" onClick={() => setIsEditing(true)} />
            <IconButton icon="delete" label="Delete" onClick={handleDelete} disabled={deletePerson.isPending} />
        </>
    );
    if (isLoading) return <LoadingIndicator />;
    if (error && isNotFoundError(error)) return <NotFoundMessage />;
    if (error) return <ApiErrorMessage error={error} message="Error loading person" />;
    if (!data) return <NotFoundMessage />;

    return (
        <div>
            {isEditing ? (
                <PersonEditForm person={data} roles={roles} onDone={() => setIsEditing(false)} />
            ) : (
                <PersonDetails person={data} roles={roles} controls={controls}>
                    <ApiErrorMessage
                        error={deletePerson.error ? getApiError(deletePerson.error) : undefined}
                        message="Could not delete person"
                    />
                </PersonDetails>
            )}{" "}
            <h2 className="section-title">Filmography</h2>
            <RoleSwitch
                role={role}
                actingCount={actingFilms.length}
                directingCount={directingFilms.length}
                onSelect={selectRole}
            />
            <FilmBrowser films={films} search={browserSearch} />
        </div>
    );
}

export default PersonPage;
