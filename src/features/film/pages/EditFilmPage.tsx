import { useNavigate } from "react-router";
import { useRequiredId } from "../../../shared/utils/useRequiredId.ts";
import { FilmForm } from "../components/FilmForm.tsx";
import { useFilm } from "../queries/useFilm.ts";
import { useUpdateFilm } from "../queries/useUpdateFilm.ts";
import { useDeleteFile } from "../../media/queries/useDeleteFile.ts";
import { isFormChanged } from "../utils/formState.ts";
import { ApiErrorMessage } from "../../../shared/components/ApiErrorMessage.tsx";

function EditFilmPage() {
    const id = useRequiredId();
    const navigate = useNavigate();
    const filmQuery = useFilm(id);
    const updateFilm = useUpdateFilm();
    const deletePoster = useDeleteFile();

    if (filmQuery.isLoading) {
        return <h1>Loading...</h1>;
    }
    if (filmQuery.error) {
        return <ApiErrorMessage error={filmQuery.error} message="Error loading film" />;
    }
    if (!filmQuery.data) {
        return <h1>Film not found</h1>;
    }

    const film = filmQuery.data;

    return (
        <FilmForm
            initialFilm={film}
            confirmMessage="Confirm update film?"
            isPending={updateFilm.isPending}
            isChanged={(form, posterFile) => isFormChanged(form, film) || posterFile !== null}
            onCancel={() => navigate(`/films/${id}`)}
            onSave={(request, options) => {
                const oldPosterName = film.posterName ?? null;

                updateFilm.mutate(
                    { id, request },
                    {
                        onSuccess: (updatedFilm) => {
                            if (oldPosterName && oldPosterName !== request.posterName) {
                                deletePoster.mutate(oldPosterName);
                            }
                            options.onSuccess();
                            navigate(`/films/${updatedFilm.id}`);
                        },
                        onError: options.onError,
                    },
                );
            }}
        />
    );
}

export default EditFilmPage;
