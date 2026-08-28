import {useState} from "react";
import {useNavigate} from "react-router";
import {useCollections} from "../queries/useCollections.ts";
import {useCreateCollection} from "../queries/useCreateCollection.ts";
import {useUpdateCollection} from "../queries/useUpdateCollection.ts";
import {useDeleteCollection} from "../queries/useDeleteCollection.ts";
import {useAddFilm} from "../queries/useAddFilm.ts";
import {useRemoveFilm} from "../queries/useRemoveFilm.ts";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import {getApiError} from "../../../shared/api/apiError.ts";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {ApiErrorMessage} from "../../../shared/components/ApiErrorMessage.tsx";
import {IconButton} from "../../../shared/components/IconButton.tsx";
import {Dialog} from "../../../shared/components/Dialog.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import type {Collection} from "../types/collection.ts";
import type {CollectionRequest} from "../types/collectionRequest.ts";
import "../../../shared/styles/popup.css";
import "../../../shared/styles/item.css";
import "../../../shared/styles/details.css";

type Props = {
    onClose: () => void;
    filmId?: number;
};

export function CollectionsPopup({onClose, filmId}: Readonly<Props>) {
    const [isCreating, setIsCreating] = useState(false);
    const [collectionName, setCollectionName] = useState("");
    const [editingCollection, setEditingCollection] = useState<Collection>();
    const [form, setForm] = useState<CollectionRequest>({name: ""});
    const [apiError, setApiError] = useState<ApiError | Error>();
    const navigate = useNavigate();
    const isFilmManagement = filmId !== undefined;
    const createCollection = useCreateCollection();
    const updateCollection = useUpdateCollection();
    const deleteCollection = useDeleteCollection();
    const addFilm = useAddFilm();
    const removeFilm = useRemoveFilm();
    const {
        data: collections = [],
        isLoading,
        error
    } = useCollections();

    const resetCreateForm = () => {
        setApiError(undefined);
        setCollectionName("");
        setIsCreating(false);
    };

    const resetEditForm = () => {
        setApiError(undefined);
        setEditingCollection(undefined);
        setForm({name: ""});
    };

    const resetForms = () => {
        resetCreateForm();
        resetEditForm();
    };

    const closePopup = () => {
        resetForms();
        onClose();
    };

    const navigateToCollection = (collectionId: number) => {
        closePopup();
        navigate(`/collections/${collectionId}`);
    };

    const startCreating = () => {
        setApiError(undefined);
        resetEditForm();
        setCollectionName("");
        setIsCreating(true);
    };

    const startEditing = (collection: Collection) => {
        setApiError(undefined);
        setIsCreating(false);
        setCollectionName("");
        setEditingCollection(collection);
        setForm({name: collection.name});
    };

    const handleApiError = (error: Error) => {
        setApiError(getApiError(error));
    };

    const handleCreate = () => {
        const name = collectionName.trim();
        if (!name || createCollection.isPending) return;

        createCollection.mutate(
            {request: {name}},
            {
                onSuccess: resetCreateForm,
                onError: handleApiError
            }
        );
    };

    const handleUpdate = () => {
        const name = form.name.trim();
        if (!editingCollection || !name || updateCollection.isPending) return;

        updateCollection.mutate(
            {id: editingCollection.id, request: {name}},
            {
                onSuccess: resetEditForm,
                onError: handleApiError
            }
        );
    };

    const handleDelete = (collectionId: number) => {
        if (!confirm("Confirm delete collection?")) return;
        setApiError(undefined);

        deleteCollection.mutate(
            collectionId,
            {
                onSuccess: resetEditForm,
                onError: handleApiError
            }
        );
    };

    const collectionHasFilm = (collection: Collection) =>
        filmId !== undefined && collection.filmIds.includes(filmId);

    const handleAddFilm = (collectionId: number) => {
        if (filmId === undefined || addFilm.isPending) return;
        setApiError(undefined);

        addFilm.mutate(
            {collectionId, filmId},
            {
                onSuccess: () => setApiError(undefined),
                onError: handleApiError
            }
        );
    };

    const handleRemoveFilm = (collectionId: number) => {
        if (filmId === undefined || removeFilm.isPending) return;
        setApiError(undefined);

        removeFilm.mutate(
            {collectionId, filmId},
            {
                onSuccess: () => setApiError(undefined),
                onError: handleApiError
            }
        );
    };

    let collectionsContent;
    if (isLoading) {
        collectionsContent = <h1>Loading...</h1>;
    } else if (error) {
        collectionsContent = <ApiErrorMessage error={error} message="Error loading collections"/>;
    } else {
        collectionsContent = (
            <div className="collection-popup">
                {isCreating && (
                    <div className="array-editor-row collection-row">
                        <TextInput
                            id="collection-name"
                            ariaLabel="collection name"
                            value={collectionName}
                            maxLength={255}
                            placeholder="Collection name"
                            regex={INPUT_RULES.title}
                            disabled={createCollection.isPending}
                            onChange={setCollectionName}
                            onEnter={handleCreate}
                        />
                        <IconButton
                            icon="accept"
                            label="Save"
                            onClick={handleCreate}
                            disabled={!collectionName.trim() || createCollection.isPending}
                        />
                        <IconButton
                            icon="cancel"
                            label="Cancel"
                            onClick={resetCreateForm}
                            disabled={createCollection.isPending}
                        />
                    </div>
                )}

                {collections.map((collection) => (
                    <div key={collection.id} className="array-editor-row collection-row">
                        {editingCollection?.id === collection.id ? (
                            <>
                                <TextInput
                                    id={`collection-${collection.id}`}
                                    ariaLabel={`edit collection ${collection.name}`}
                                    value={form.name}
                                    maxLength={255}
                                    placeholder="Collection name"
                                    regex={INPUT_RULES.title}
                                    disabled={updateCollection.isPending}
                                    onChange={(name) => setForm({name})}
                                    onEnter={handleUpdate}
                                />
                                <IconButton
                                    icon="accept"
                                    label="Save"
                                    onClick={handleUpdate}
                                    disabled={
                                        !form.name.trim() ||
                                        form.name.trim() === collection.name.trim() ||
                                        updateCollection.isPending
                                    }
                                />
                                <IconButton
                                    icon="cancel"
                                    label="Cancel"
                                    onClick={resetEditForm}
                                    disabled={updateCollection.isPending}
                                />
                            </>
                        ) : (
                            <>
                                <button
                                    className="list-item-button"
                                    onClick={() => navigateToCollection(collection.id)}
                                >
                                    <span className="collection-item-name">{collection.name}</span>
                                    <span className="item-label">{collection.filmIds.length}</span>
                                </button>
                                {isFilmManagement ? (
                                    <>
                                        <IconButton
                                            icon="add"
                                            label="add film"
                                            onClick={() => handleAddFilm(collection.id)}
                                            disabled={
                                                collectionHasFilm(collection) ||
                                                addFilm.isPending ||
                                                removeFilm.isPending
                                            }
                                        />
                                        <IconButton
                                            icon="remove"
                                            label="remove film"
                                            onClick={() => handleRemoveFilm(collection.id)}
                                            disabled={
                                                !collectionHasFilm(collection) ||
                                                addFilm.isPending ||
                                                removeFilm.isPending
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <IconButton
                                            icon="edit"
                                            label="rename"
                                            onClick={() => startEditing(collection)}
                                            disabled={updateCollection.isPending || deleteCollection.isPending}
                                        />
                                        <IconButton
                                            icon="delete"
                                            label="delete"
                                            onClick={() => handleDelete(collection.id)}
                                            disabled={updateCollection.isPending || deleteCollection.isPending}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Dialog
            label="Collections"
            closeLabel="Close collections"
            onClose={closePopup}
        >
            <div className="filter-section-header">
                <span>Collections</span>
                {!isFilmManagement && (
                    <IconButton
                        icon="create"
                        label="Create new collection"
                        onClick={startCreating}
                        disabled={isCreating || isLoading || !!error || createCollection.isPending}
                    />
                )}
            </div>

            {collectionsContent}

            <ApiErrorMessage error={apiError}/>
        </Dialog>
    );
}
