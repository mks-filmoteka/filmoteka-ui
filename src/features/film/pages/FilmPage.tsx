import {useFilmQuery} from "../queries/useFilmQuery.ts";
import "../../../shared/styles/details.css";
import {useIsAdmin} from "../../../shared/auth/useAuth.ts";
import {useState} from "react";
import {useRequiredParam} from "../../../shared/queries/useRequiredParam.ts";
import {useUpdateFilm} from "../queries/useUpdateFilm.ts";
import type {FilmRequest} from "../types/filmRequest.ts";
import {FilmDetails} from "../components/FilmDetails.tsx";
import {FilmForm} from "../components/FilmForm.tsx";
import {fillForm, fillRequest, isFormChanged} from "../utils/formState.ts";

function FilmPage() {
    const isAdmin = useIsAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<FilmRequest>(fillForm());
    const id = useRequiredParam("id");
    const {data, isLoading, error} = useFilmQuery(id);
    const updateFilm = useUpdateFilm();

    const handleSave = () => {
        updateFilm.mutate(
            {
                id,
                request: fillRequest(form)
            },
            {onSuccess: () => setIsEditing(false)}
        );
    };

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
                    isChanged={isFormChanged(form, data)}
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