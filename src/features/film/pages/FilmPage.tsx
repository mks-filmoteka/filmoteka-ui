import {useFilm} from "../queries/useFilm.ts";
import "../../../shared/styles/details.css";
import {useAuth} from "../../../auth/useAuth.ts";
import {useState} from "react";
import {useRequiredId} from "../../../shared/queries/useRequiredParam.ts";
import {useUpdateFilm} from "../queries/useUpdateFilm.ts";
import {FilmDetails} from "../components/FilmDetails.tsx";
import {FilmFormController} from "../components/FilmFormController.tsx";
import {isFormChanged} from "../utils/formState.ts";
import {useDeleteFilm} from "../queries/useDeleteFilm.ts";
import {useNavigate} from "react-router";
import {useDeleteFile} from "../../media/queries/useDeleteFile.ts";
import {CollectionsPopup} from "../../collection/components/CollectionsPopup.tsx";

function FilmPage() {
    const navigate = useNavigate();
    const {authenticated, isAdmin} = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [collectionsOpen, setCollectionsOpen] = useState(false);
    const id = useRequiredId("id");
    const {data, isLoading, error} = useFilm(id);
    const updateFilm = useUpdateFilm();
    const deleteFilm = useDeleteFilm();
    const deletePoster = useDeleteFile();

    const handleDelete = () => {
        if (!confirm("Confirm delete film?")) return;
        const posterName = data?.posterName;
        deleteFilm.mutate(id, {
            onSuccess: () => {
                if (!posterName) {
                    navigate("/films");
                    return;
                }
                deletePoster.mutate(
                    posterName, {
                        onSettled: () => {
                            navigate("/films");
                        }
                    }
                );
            },
        });
    };

    if (isLoading) return <h1>Loading...</h1>;
    if (error) return <h1>Error loading film: {error.message}</h1>;
    if (!data) return <h1>Film not found</h1>;

    return (
        <div>
            {isEditing ? (
                <FilmFormController
                    initialFilm={data}
                    confirmMessage="Confirm update film?"
                    onCancel={() => setIsEditing(false)}
                    onSave={(request, options) => {
                        const oldPosterName = data.posterName ?? null;
                        updateFilm.mutate(
                            {id, request}, {
                                onSuccess: () => {
                                    if (oldPosterName && oldPosterName !== request.posterName) {
                                        deletePoster.mutate(oldPosterName);
                                    }
                                    options.onSuccess();
                                },
                                onError: options.onError
                            }
                        );
                    }}
                    isChanged={(form, posterFile) => isFormChanged(form, data) || posterFile !== null}
                    isPending={updateFilm.isPending}
                />
            ) : (
                <FilmDetails
                    data={data}
                    isAdmin={isAdmin}
                    onEdit={() => {
                        setIsEditing(true);
                    }}
                    onDelete={handleDelete}
                    onOpenCollections={authenticated ? () => setCollectionsOpen(true) : undefined}
                />
            )}
            {authenticated && collectionsOpen && (
                <CollectionsPopup
                    filmId={data.id}
                    onClose={() => setCollectionsOpen(false)}
                />
            )}
        </div>
    );
}

export default FilmPage;
