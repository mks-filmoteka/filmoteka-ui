import {useRequiredId} from "../../../shared/utils/useRequiredId.ts";
import {useCollection} from "../queries/useCollection.ts";
import {useCollectionFilmEditor} from "../queries/useCollectionFilmEditor.ts";
import {FilmListScreen} from "../../film/components/FilmListScreen.tsx";
import {useCollectionFilms} from "../../film/queries/useCollectionFilms.ts";
import {useFilmListSearchState} from "../../film/queries/useFilmListSearchState.ts";
import {useFilms} from "../../film/queries/useFilms.ts";
import {PageHeader} from "../../../shared/components/PageHeader.tsx";

function CollectionPage() {
    const collectionId = useRequiredId();
    const search = useFilmListSearchState();
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
        return <h1>Error loading collection: {selectedCollectionQuery.error.message}</h1>;
    }
    if (activeFilmsQuery.error) {
        return <h1>Error loading films: {activeFilmsQuery.error.message}</h1>;
    }

    return (
        <div>
            <PageHeader
                title={collection?.name}
                controls={!collectionFilmEditor.isEditing && (
                    <button
                        title={`Add films to ${collection?.name}`}
                        onClick={collectionFilmEditor.startEditing}
                    >
                        ✚
                    </button>
                )}
            />
            <hr/>
            <FilmListScreen
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
