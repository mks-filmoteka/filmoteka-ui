import {useState} from "react";
import {useNavigate} from "react-router";
import type {AxiosError} from "axios";
import {useCollections} from "../queries/useCollections.ts";
import {useCreateCollection} from "../queries/useCreateCollection.ts";
import {useUpdateCollection} from "../queries/useUpdateCollection.ts";
import {useDeleteCollection} from "../queries/useDeleteCollection.ts";
import {useAddFilm} from "../queries/useAddFilm.ts";
import {useRemoveFilm} from "../queries/useRemoveFilm.ts";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import type {Collection} from "../types/collection.ts";
import type {CollectionRequest} from "../types/collectionRequest.ts";
import "../../../shared/styles/popup.css";
import "../../../shared/styles/item.css";
import "../../../shared/styles/details.css";

type Props = {
    onClose: () => void;
    filmId?: number | string;
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

    const navigateToCollection = (collectionId: string) => {
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
        const err = error as AxiosError<ApiError>;
        setApiError(err.response?.data ?? error);
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

    const handleDelete = (collectionId: string) => {
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
        collection.filmIds.some((id) => String(id) === String(filmId));

    const handleAddFilm = (collectionId: string) => {
        if (filmId === undefined || addFilm.isPending) return;
        setApiError(undefined);

        addFilm.mutate(
            {collectionId, filmId: String(filmId)},
            {
                onSuccess: () => setApiError(undefined),
                onError: handleApiError
            }
        );
    };

    const handleRemoveFilm = (collectionId: string) => {
        if (filmId === undefined || removeFilm.isPending) return;
        setApiError(undefined);

        removeFilm.mutate(
            {collectionId, filmId: String(filmId)},
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
        collectionsContent = <h1>Error loading collections: {error.message}</h1>;
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
                        <button
                            title="Save"
                            onClick={handleCreate}
                            disabled={!collectionName.trim() || createCollection.isPending}
                        >
                            ✔
                        </button>
                        <button
                            title="Cancel"
                            onClick={resetCreateForm}
                            disabled={createCollection.isPending}
                        >
                            ✖
                        </button>
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
                                <button
                                    title="Save"
                                    onClick={handleUpdate}
                                    disabled={
                                        !form.name.trim() ||
                                        form.name.trim() === collection.name.trim() ||
                                        updateCollection.isPending
                                    }
                                >
                                    ✔
                                </button>
                                <button
                                    title="Cancel"
                                    onClick={resetEditForm}
                                    disabled={updateCollection.isPending}
                                >
                                    ✖
                                </button>
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
                                        <button
                                            title="add film"
                                            onClick={() => handleAddFilm(collection.id)}
                                            disabled={
                                                collectionHasFilm(collection) ||
                                                addFilm.isPending ||
                                                removeFilm.isPending
                                            }
                                        >
                                            +
                                        </button>
                                        <button
                                            title="remove film"
                                            onClick={() => handleRemoveFilm(collection.id)}
                                            disabled={
                                                !collectionHasFilm(collection) ||
                                                addFilm.isPending ||
                                                removeFilm.isPending
                                            }
                                        >
                                            -
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            title="rename"
                                            onClick={() => startEditing(collection)}
                                            disabled={updateCollection.isPending || deleteCollection.isPending}
                                        >
                                            ✎
                                        </button>
                                        <button
                                            title="delete"
                                            onClick={() => handleDelete(collection.id)}
                                            disabled={updateCollection.isPending || deleteCollection.isPending}
                                        >
                                            🗑
                                        </button>
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
        <div className="popup-overlay">
            <button
                className="popup-backdrop-button"
                aria-label="Close collections"
                title="Close"
                onClick={closePopup}
            />
            <div className="popup" role="dialog" aria-label="Collections">
                <div className="filter-section-header">
                    <span>Collections</span>
                    {!isFilmManagement && (
                        <button
                            title="Create new collection"
                            onClick={startCreating}
                            disabled={isCreating || isLoading || !!error || createCollection.isPending}
                        >
                            ✚
                        </button>
                    )}
                </div>

                {collectionsContent}

                {apiError && (
                    <div style={{ color: "red" }}>
                        <div>{apiError.message}</div>
                        <div>
                            {"errorDetails" in apiError && apiError.errorDetails?.map((detail) => (
                                <div key={detail.field}>{detail.field}: {detail.message}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
