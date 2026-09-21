import { useFilm } from "../queries/useFilm.ts";
import { useAuth } from "../../../auth/useAuth.ts";
import { useState } from "react";
import { useRequiredId } from "../../../shared/utils/useRequiredId.ts";
import { FilmDetails } from "../components/FilmDetails.tsx";
import { useDeleteFilm } from "../queries/useDeleteFilm.ts";
import { useNavigate } from "react-router";
import { CollectionsPopup } from "../../collection/components/CollectionsPopup.tsx";
import { PageHeader } from "../../../shared/components/PageHeader.tsx";
import { ApiErrorMessage } from "../../../shared/components/ApiErrorMessage.tsx";
import { IconButton } from "../../../shared/components/IconButton.tsx";
import { getApiError } from "../../../shared/api/apiError.ts";

function FilmPage() {
    const navigate = useNavigate();
    const { authenticated, isAdmin } = useAuth();
    const [collectionsOpen, setCollectionsOpen] = useState(false);
    const id = useRequiredId();
    const { data, isLoading, error } = useFilm(id);
    const deleteFilm = useDeleteFilm();

    const handleDelete = () => {
        if (!confirm("Confirm delete film?")) return;
        deleteFilm.mutate(id, {
            onSuccess: () => navigate("/films"),
        });
    };

    if (isLoading) return <h1>Loading...</h1>;
    if (error) return <ApiErrorMessage error={error} message="Error loading film" />;
    if (!data) return <h1>Film not found</h1>;

    return (
        <div>
            <PageHeader
                title={`${data.title} (${data.releaseYear})`}
                meta={data.genres[0] ?? ""}
                controls={
                    <>
                        {authenticated && (
                            <IconButton
                                icon="collection"
                                label="Collections"
                                onClick={() => setCollectionsOpen(true)}
                            />
                        )}
                        {isAdmin && (
                            <>
                                <IconButton icon="edit" label="Edit" onClick={() => navigate(`/films/${id}/edit`)} />
                                <IconButton
                                    icon="delete"
                                    label="Delete"
                                    onClick={handleDelete}
                                    disabled={deleteFilm.isPending}
                                />
                                <ApiErrorMessage
                                    error={deleteFilm.error ? getApiError(deleteFilm.error) : undefined}
                                    message="Could not delete film"
                                />
                            </>
                        )}
                    </>
                }
            />
            <hr />
            <FilmDetails data={data} />
            {authenticated && collectionsOpen && (
                <CollectionsPopup filmId={data.id} onClose={() => setCollectionsOpen(false)} />
            )}
        </div>
    );
}

export default FilmPage;
