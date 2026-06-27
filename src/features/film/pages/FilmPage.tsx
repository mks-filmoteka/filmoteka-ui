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
import type {AxiosError} from "axios";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import {useDeleteFilm} from "../queries/useDeleteFilm.ts";
import {useNavigate} from "react-router-dom";

function FilmPage() {
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<FilmRequest>(fillForm());
    const id = useRequiredParam("id");
    const {data, isLoading, error} = useFilmQuery(id);
    const updateFilm = useUpdateFilm();
    const deleteFilm = useDeleteFilm();
    const [apiError, setApiError] = useState<ApiError | Error>();

    const handleSave = () => {
        if (!confirm("Confirm update film?")) return;
        updateFilm.mutate(
            {id, request: fillRequest(form)},
            {
                onSuccess: () => setIsEditing(false),
                onError: (error: Error) => {
                    const err = error as AxiosError<ApiError>;
                    setApiError(err.response?.data ?? error);
                }
            }
        );
    };
    const handleDelete = () => {
        if (!confirm("Confirm delete film?")) return;
        deleteFilm.mutate(id, {
            onSuccess: () => {
                navigate("/films")
            }
        });
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
                    apiError={apiError}
                />
            ) : (
                <FilmDetails
                    data={data}
                    isAdmin={isAdmin}
                    onEdit={() => {
                        setIsEditing(true);
                        setForm(fillForm(data));
                    }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}

export default FilmPage;