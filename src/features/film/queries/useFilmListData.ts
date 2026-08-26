import {useCollection} from "../../collection/queries/useCollection.ts";
import {useCollectionFilmEditor} from "../../collection/queries/useCollectionFilmEditor.ts";
import type {FilmFilter} from "../types/filmFilter.ts";
import {useCollectionFilms} from "./useCollectionFilms.ts";
import {useFilms} from "./useFilms.ts";

type Params = {
    collectionId?: string;
    filmFilter: FilmFilter;
    isCollection: boolean;
};

export function useFilmListData(params: Params) {
    const {collectionId, filmFilter, isCollection} = params;
    const selectedCollectionQuery = useCollection(isCollection ? collectionId : undefined);
    const collection = selectedCollectionQuery.data;
    const filmIds = collection?.filmIds ?? [];
    const collectionFilmEditor = useCollectionFilmEditor({
        collectionId,
        filmIds
    });
    const isEditingCollectionFilms = isCollection && collectionFilmEditor.isEditing;
    const filmsQuery = useFilms(filmFilter, !isCollection || isEditingCollectionFilms);
    const collectionFilmsQuery = useCollectionFilms(
        {...filmFilter, ids: filmIds},
        isCollection && !isEditingCollectionFilms
    );
    const activeFilmsQuery = isCollection && !isEditingCollectionFilms
        ? collectionFilmsQuery
        : filmsQuery;
    const collectionEditingProps = isEditingCollectionFilms
        ? {
            onSave: collectionFilmEditor.save,
            onCancel: collectionFilmEditor.cancelEditing,
            saveDisabled: !collectionFilmEditor.hasChanges || collectionFilmEditor.isPending,
            cancelDisabled: collectionFilmEditor.isPending,
            selectedFilmIds: collectionFilmEditor.selectedFilmIds,
            onFilmCheckedChange: collectionFilmEditor.updateSelection,
            selectionDisabled: collectionFilmEditor.isPending
        }
        : {};

    return {
        selectedCollectionQuery,
        activeFilmsQuery,
        collection,
        collectionFilmEditor,
        isEditingCollectionFilms,
        collectionEditingProps
    };
}
