import {useState} from "react";
import {useUpdateCollectionFilms} from "./useUpdateCollectionFilms.ts";

type Params = {
    collectionId?: number;
    filmIds: number[];
    onError?: (error: Error) => void;
    onClearError?: () => void;
};

function updateFilmIdSet(current: Set<number>, filmId: number, shouldContain: boolean) {
    const next = new Set(current);
    if (shouldContain) {
        next.add(filmId);
    } else {
        next.delete(filmId);
    }
    return next;
}

export function useCollectionFilmEditor(params: Params) {
    const {collectionId, filmIds, onError, onClearError} = params;
    const handleError = onError ?? (() => {});
    const clearError = onClearError ?? (() => {});
    const updateCollectionFilms = useUpdateCollectionFilms();
    const [editingCollectionId, setEditingCollectionId] = useState<number>();
    const [selectedFilmIds, setSelectedFilmIds] = useState<Set<number>>(() => new Set());
    const [addedFilmIds, setAddedFilmIds] = useState<Set<number>>(() => new Set());
    const [removedFilmIds, setRemovedFilmIds] = useState<Set<number>>(() => new Set());

    const collectionFilmIds = new Set(filmIds);
    const isEditing = !!collectionId && editingCollectionId === collectionId;
    const hasChanges = addedFilmIds.size > 0 || removedFilmIds.size > 0;

    const reset = () => {
        setSelectedFilmIds(new Set());
        setAddedFilmIds(new Set());
        setRemovedFilmIds(new Set());
        clearError();
    };

    const startEditing = () => {
        if (!collectionId) return;
        setSelectedFilmIds(new Set(filmIds));
        setAddedFilmIds(new Set());
        setRemovedFilmIds(new Set());
        clearError();
        setEditingCollectionId(collectionId);
    };

    const cancelEditing = () => {
        setEditingCollectionId(undefined);
        reset();
    };

    const updateSelection = (filmId: number, checked: boolean) => {
        const wasInCollection = collectionFilmIds.has(filmId);

        setSelectedFilmIds((current) => updateFilmIdSet(current, filmId, checked));
        setAddedFilmIds((current) => updateFilmIdSet(current, filmId, !wasInCollection && checked));
        setRemovedFilmIds((current) => updateFilmIdSet(current, filmId, wasInCollection && !checked));
    };

    const save = () => {
        if (!collectionId || !hasChanges || updateCollectionFilms.isPending) return;
        clearError();

        updateCollectionFilms.mutate(
            {
                collectionId,
                request: {
                    addedFilmIds: Array.from(addedFilmIds),
                    removedFilmIds: Array.from(removedFilmIds)
                }
            },
            {
                onSuccess: () => {
                    setEditingCollectionId(undefined);
                    reset();
                },
                onError: handleError
            }
        );
    };

    return {
        isEditing,
        selectedFilmIds,
        hasChanges,
        isPending: updateCollectionFilms.isPending,
        startEditing,
        cancelEditing,
        updateSelection,
        save
    };
}
