import {useFilm} from "../queries/useFilm.ts";
import "../../../shared/styles/details.css";
import {useAuth} from "../../../auth/useAuth.ts";
import {useState} from "react";
import {useRequiredId} from "../../../shared/utils/useRequiredId.ts";
import {FilmDetails} from "../components/FilmDetails.tsx";
import {useDeleteFilm} from "../queries/useDeleteFilm.ts";
import {useNavigate} from "react-router";
import {useDeleteFile} from "../../media/queries/useDeleteFile.ts";
import {CollectionsPopup} from "../../collection/components/CollectionsPopup.tsx";
import {PageHeader} from "../../../shared/components/PageHeader.tsx";
import {ApiErrorMessage} from "../../../shared/components/ApiErrorMessage.tsx";

function FilmPage() {
    const navigate = useNavigate();
    const {authenticated, isAdmin} = useAuth();
    const [collectionsOpen, setCollectionsOpen] = useState(false);
    const id = useRequiredId();
    const {data, isLoading, error} = useFilm(id);
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
    if (error) return <ApiErrorMessage error={error} message="Error loading film"/>;
    if (!data) return <h1>Film not found</h1>;

    return (
        <div>
            <PageHeader
                title={`${data.title} (${data.releaseYear})`}
                meta={data.genres[0] ?? ""}
                controls={(
                    <>
                        {authenticated && (
                            <button title="Collections" onClick={() => setCollectionsOpen(true)}>
                                ★
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                <button title="Edit" onClick={() => navigate(`/films/${id}/edit`)}>
                                    ✎
                                </button>
                                <button title="Delete" onClick={handleDelete}>
                                    🗑
                                </button>
                            </>
                        )}
                    </>
                )}
            />
            <hr/>
            <FilmDetails data={data}/>
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
