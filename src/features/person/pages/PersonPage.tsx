import {usePerson} from "../queries/usePerson.ts";
import {useState} from "react";
import {useFilmSearchParams} from "../../film/queries/useFilmSearchParams.ts";
import {FilmBrowser} from "../../film/components/FilmBrowser.tsx";
import type {FilmBasic} from "../../film/types/filmBasic.ts";
import {SORT_BY, SORT_DIR} from "../../film/constants/constants.ts";
import {useAuth} from "../../../auth/useAuth.ts";
import {useUpdatePerson} from "../queries/useUpdatePerson.ts";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import {useRequiredId} from "../../../shared/utils/useRequiredId.ts";
import type {PersonRequest} from "../types/personRequest.ts";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import {getApiError} from "../../../shared/api/apiError.ts";
import {PageHeader} from "../../../shared/components/PageHeader.tsx";
import {ApiErrorMessage} from "../../../shared/components/ApiErrorMessage.tsx";
import {IconButton} from "../../../shared/components/IconButton.tsx";

function PersonPage({type}: Readonly<{ type: "actor" | "director" }>) {
    const id = useRequiredId();
    const {data, isLoading, error} = usePerson(type, id);
    const isAdmin = useAuth().isAdmin;
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<PersonRequest>({name: ""});
    const updatePerson = useUpdatePerson(type);
    const isChanged = form.name.trim() !== data?.name.trim();
    const isInvalid = !form.name.trim();
    const [apiError, setApiError] = useState<ApiError | Error>();
    const handleSave = () => {
        if (!confirm(`Confirm ${type} update?`)) return;
        updatePerson.mutate(
            {id, request: {name: form.name.trim()}},
            {
                onSuccess: () => setIsEditing(false),
                onError: (error: Error) => {
                    setApiError(getApiError(error));
                }
            }
        );
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
        setView, setGenres, setYearFrom, setYearTo, resetYears, setCountries, setSort
    } = useFilmSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);

    const filtering = (film: FilmBasic) => {
        if (minYear && film.releaseYear < minYear) return false;
        if (maxYear && film.releaseYear > maxYear) return false;
        if (genres.length && !film.genres.some(g => genres.includes(g))) return false;
        return !(countries.length && !film.countries.some(country => countries.includes(country)));

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
    const films = (data?.films ?? [])
        .filter(filtering)
        .sort(sorting);

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
        setFilterOpen
    };

    const pageHeader = (
        <PageHeader
            title={isEditing ? (
                <TextInput
                    id={"name-edit"}
                    ariaLabel="edit name"
                    value={form.name}
                    maxLength={100}
                    onChange={(value) =>
                        setForm(prev => ({
                            ...prev,
                            name: value
                        }))
                    }
                    regex={INPUT_RULES.name}
                    placeholder="Edit name"
                />
            ) : data?.name}
            meta={type}
            controls={isEditing ? (
                <>
                    <IconButton
                        icon="accept"
                        label="Save"
                        onClick={handleSave}
                        disabled={!isChanged || updatePerson.isPending || isInvalid}
                    />
                    <IconButton
                        icon="cancel"
                        label="Cancel"
                        onClick={() => {
                            setIsEditing(false);
                            setForm({name: data?.name ?? ""});
                        }}
                    />
                </>
            ) : isAdmin && data && (
                <IconButton
                    icon="edit"
                    label="Edit"
                    onClick={() => {
                        setIsEditing(true);
                        setForm({name: data.name});
                    }}
                />
            )}
        >
            {isEditing && <ApiErrorMessage error={apiError}/>}
        </PageHeader>
    );

    if (isLoading) return <h1>Loading...</h1>;
    if (error) return <ApiErrorMessage error={error} message={`Error loading ${type}`}/>;
    if (!data) return <h1>{type} not found</h1>;

    return (
        <div>
            {pageHeader}
            <hr/>
            <FilmBrowser
                films={films}
                search={browserSearch}
            />
        </div>
    );
}

export default PersonPage;
