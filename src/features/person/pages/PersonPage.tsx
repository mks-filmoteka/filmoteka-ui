import {usePersonQuery} from "../queries/usePersonQuery.ts";
import {useState} from "react";
import {useFilmSearchParams} from "../../film/queries/useFilmSearchParams.ts";
import {FilmList} from "../../film/components/FilmList.tsx";
import type {FilmBasic} from "../../film/types/filmBasic.ts";
import {SORT_BY, SORT_DIR} from "../../film/constants/constants.ts";
import {useIsAdmin} from "../../../shared/auth/useAuth.ts";
import {useUpdatePerson} from "../queries/useUpdatePerson.ts";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import {useRequiredParam} from "../../../shared/queries/useRequiredParam.ts";

function PersonPage({type}: Readonly<{ type: "actor" | "director" }>) {
    const isAdmin = useIsAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({name: ""});
    const id = useRequiredParam("id");
    const {data, isLoading, error} = usePersonQuery(type, id);
    const updatePerson = useUpdatePerson(type);
    const isChanged = form.name.trim() !== data?.name.trim();
    const handleSave = () => {
        updatePerson.mutate(
            {id, request: {name: form.name.trim()}},
            {onSuccess: () => setIsEditing(false)}
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
        return !(countries.length && !countries.includes(film.country));

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

    const pageTitle = (
        <div className="page-title">
            {isEditing ? (
                <>
                    {/*TITLE OR EDIT INPUT*/}
                    <h1>
                        <TextInput
                            id={"name-edit"}
                            aria-label="edit name"
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
                    </h1>
                    <div>
                        {type}

                        {/*SAVE BUTTON*/}
                        <div className="page-title-controls">
                            <button
                                onClick={handleSave}
                                disabled={!isChanged || updatePerson.isPending}
                            >
                                ✔
                            </button>

                            {/*CANCEL BUTTON*/}
                            <button onClick={() => {
                                setIsEditing(false);
                                setForm({name: data?.name ?? ""});
                            }}>
                                ✖
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h1>{data?.name}</h1>
                    <div>
                        {type}
                        <div className="page-title-controls">

                            {/*EDIT BUTTON*/}
                            {isAdmin && data && (
                                <button onClick={() => {
                                    setIsEditing(true);
                                    setForm({name: data.name});
                                }}>
                                    ✎
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    if (!data) return <h1>{type} not found</h1>;
    if (isLoading) return <h1>Loading...</h1>;

    if (error) {
        return (
            <div>
                <h1>
                    Error loading {type}
                </h1>
                {error.message}
            </div>
        );
    }

    return (
        <FilmList
            films={films}
            pageTitle={pageTitle}
            page={0}
            pageSize={0}
            totalPages={0}
            setPage={() => {}}
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
    );
}

export default PersonPage;