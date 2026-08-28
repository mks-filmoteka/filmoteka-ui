import {useRequiredId} from "../../../shared/utils/useRequiredId.ts";
import {useCollection} from "../queries/useCollection.ts";
import {useCollectionFilmEditor} from "../queries/useCollectionFilmEditor.ts";
import {FilmBrowser} from "../../film/components/FilmBrowser.tsx";
import {useCollectionFilms} from "../../film/queries/useCollectionFilms.ts";
import {useFilms} from "../../film/queries/useFilms.ts";
import {PageHeader} from "../../../shared/components/PageHeader.tsx";
import {useFilmApiParams} from "../../film/queries/useFilmApiParams.ts";
import {ApiErrorMessage} from "../../../shared/components/ApiErrorMessage.tsx";
import {IconButton} from "../../../shared/components/IconButton.tsx";

function CollectionPage() {
    const collectionId = useRequiredId();
    const search = useFilmApiParams();
    const selectedCollectionQuery = useCollection(collectionId);
    const collection = selectedCollectionQuery.data;
    const filmIds = collection?.filmIds ?? [];
    const collectionFilmEditor = useCollectionFilmEditor({
        collectionId,
        filmIds
    });
    const filmsQuery = useFilms(search.filmFilter, collectionFilmEditor.isEditing);
    const collectionFilmsQuery = useCollectionFilms(
        {
            ...search.filmFilter,
            genres: search.genres,
            countries: search.countries,
            ids: filmIds
        },
        !collectionFilmEditor.isEditing
    );
    const activeFilmsQuery = collectionFilmEditor.isEditing
        ? filmsQuery
        : collectionFilmsQuery;

    if (selectedCollectionQuery.isLoading || activeFilmsQuery.isLoading) {
        return <h1>Loading...</h1>;
    }
    if (selectedCollectionQuery.error) {
        return <ApiErrorMessage error={selectedCollectionQuery.error} message="Error loading collection"/>;
    }
    if (activeFilmsQuery.error) {
        return <ApiErrorMessage error={activeFilmsQuery.error} message="Error loading films"/>;
    }

    return (
        <div>
            <PageHeader
                title={collection?.name}
                controls={!collectionFilmEditor.isEditing && (
                    <IconButton
                        icon="create"
                        label={`Add films to ${collection?.name}`}
                        onClick={collectionFilmEditor.startEditing}
                    />
                )}
            />
            <hr/>
            <FilmBrowser
                filmsData={activeFilmsQuery.data}
                search={search}
                {...(collectionFilmEditor.isEditing ? {
                    onSave: collectionFilmEditor.save,
                    onCancel: collectionFilmEditor.cancelEditing,
                    saveDisabled: !collectionFilmEditor.hasChanges || collectionFilmEditor.isPending,
                    cancelDisabled: collectionFilmEditor.isPending,
                    selectedFilmIds: collectionFilmEditor.selectedFilmIds,
                    onFilmCheckedChange: collectionFilmEditor.updateSelection,
                    selectionDisabled: collectionFilmEditor.isPending
                } : {})}
            />
        </div>
    );
}

export default CollectionPage;
