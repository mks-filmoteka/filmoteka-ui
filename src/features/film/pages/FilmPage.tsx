import {useFilmQuery} from "../queries/useFilmQuery.ts";
import "../../../shared/styles/details.css";
import {useIsAdmin} from "../../../shared/auth/useAuth.ts";
import {useState} from "react";
import {useRequiredParam} from "../../../shared/queries/useRequiredParam.ts";
import {useUpdateFilm} from "../queries/useUpdateFilm.ts";
import type {FilmRequest} from "../types/filmRequest.ts";
import type {Film} from "../types/film.ts";
import {FilmDetails} from "../components/FilmDetails.tsx";
import {FilmForm} from "../components/FilmForm.tsx";

function FilmPage() {
    const isAdmin = useIsAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<FilmRequest>(fillForm());
    const id = useRequiredParam("id");
    const {data, isLoading, error} = useFilmQuery(id);
    const updateFilm = useUpdateFilm();
    const isChanged = (form: FilmRequest, data?: Film) => {
        return data ? JSON.stringify(form) !== JSON.stringify({
            title: data.title,
            releaseYear: data.releaseYear,
            country: data.country,
            description: data.description,
            posterUrl: data.posterUrl,
            genres: data.genres,
            actors: data.actors.map(a => ({name: a.name})),
            directors: data.directors.map(d => ({name: d.name}))
        }) : false;
    }
    const handleSave = () => {
        updateFilm.mutate(
            {
                id,
                request: {
                    title: form.title.trim(),
                    releaseYear: form.releaseYear,
                    country: form.country.trim(),
                    description: form.description.trim(),
                    posterUrl: form.posterUrl.trim(),
                    genres: form.genres,
                    actors: form.actors
                        .filter(a => a.name.trim())
                        .map(a => ({
                            name: a.name.trim()
                        })),
                    directors: form.directors
                        .filter(a => a.name.trim())
                        .map(d => ({
                            name: d.name.trim()
                        }))
                }
            },
            {onSuccess: () => setIsEditing(false)}
        );
    };

    function fillForm(data?: Film): FilmRequest {
        return {
            title: data?.title ?? "",
            releaseYear: data?.releaseYear ?? 0,
            country: data?.country ?? "",
            description: data?.description ?? "",
            posterUrl: data?.posterUrl ?? "",
            genres: data?.genres ?? [],
            actors: data?.actors.map(a => ({ name: a.name })) ?? [],
            directors: data?.directors.map(d => ({ name: d.name })) ?? []
        };
    }

    if (!data) return <h1>Film not found</h1>;
    if (isLoading) return <h1>Loading...</h1>;

    if (error) {
        return (
            <div>
                <h1>
                    Error loading film
                </h1>
                {error.message}
            </div>
        );
    }

    return (
        <div>
            {isEditing ? (
                <FilmForm
                    form={form}
                    setForm={setForm}
                    onSave={handleSave}
                    onCancel={() => {
                        setIsEditing(false);
                        setForm(fillForm(data));
                    }}
                    isChanged={isChanged(form, data)}
                    isPending={updateFilm.isPending}
                />
            ) : (
                <FilmDetails
                    data={data}
                    isAdmin={isAdmin}
                    onEdit={() => {
                        setIsEditing(true);
                        setForm(fillForm(data));
                    }}
                    onDelete={() => {}}
                />
            )}
        </div>
    );
}

export default FilmPage;