import {useState} from "react";
import {useNavigate} from "react-router";
import type {AxiosError} from "axios";
import {useFilmLists} from "../queries/useFilmLists.ts";
import {useCreateFilmList} from "../queries/useCreateFilmList.ts";
import {useUpdateFilmList} from "../queries/useUpdateFilmList.ts";
import {useDeleteFilmList} from "../queries/useDeleteFilmList.ts";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import type {FilmList} from "../types/filmList.ts";
import type {FilmListRequest} from "../types/filmListRequest.ts";
import "../../../shared/styles/popup.css";
import "../../../shared/styles/item.css";
import "../../../shared/styles/details.css";

type Props = {
    onClose: () => void;
};

export function FilmListsPopup({onClose}: Readonly<Props>) {
    const [isCreating, setIsCreating] = useState(false);
    const [filmListName, setFilmListName] = useState("");
    const [editingFilmList, setEditingFilmList] = useState<FilmList>();
    const [form, setForm] = useState<FilmListRequest>({name: ""});
    const [apiError, setApiError] = useState<ApiError | Error>();
    const navigate = useNavigate();
    const createFilmList = useCreateFilmList();
    const updateFilmList = useUpdateFilmList();
    const deleteFilmList = useDeleteFilmList();
    const {
        data: filmLists = [],
        isLoading,
        error
    } = useFilmLists();

    const resetCreateForm = () => {
        setApiError(undefined);
        setFilmListName("");
        setIsCreating(false);
    };

    const resetEditForm = () => {
        setApiError(undefined);
        setEditingFilmList(undefined);
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

    const navigateToFilmList = (filmListId: string) => {
        closePopup();
        navigate(`/film-lists/${filmListId}`);
    };

    const startCreating = () => {
        setApiError(undefined);
        resetEditForm();
        setFilmListName("");
        setIsCreating(true);
    };

    const startEditing = (filmList: FilmList) => {
        setApiError(undefined);
        setIsCreating(false);
        setFilmListName("");
        setEditingFilmList(filmList);
        setForm({name: filmList.name});
    };

    const handleApiError = (error: Error) => {
        const err = error as AxiosError<ApiError>;
        setApiError(err.response?.data ?? error);
    };

    const handleCreate = () => {
        const name = filmListName.trim();
        if (!name || createFilmList.isPending) return;

        createFilmList.mutate(
            {request: {name}},
            {
                onSuccess: resetCreateForm,
                onError: handleApiError
            }
        );
    };

    const handleUpdate = () => {
        const name = form.name.trim();
        if (!editingFilmList || !name || updateFilmList.isPending) return;

        updateFilmList.mutate(
            {id: editingFilmList.id, request: {name}},
            {
                onSuccess: resetEditForm,
                onError: handleApiError
            }
        );
    };

    const handleDelete = (filmListId: string) => {
        if (!confirm("Confirm delete film list?")) return;
        setApiError(undefined);

        deleteFilmList.mutate(
            filmListId,
            {
                onSuccess: resetEditForm,
                onError: handleApiError
            }
        );
    };

    let filmListsContent;
    if (isLoading) {
        filmListsContent = <h1>Loading...</h1>;
    } else if (error) {
        filmListsContent = <h1>Error loading film lists: {error.message}</h1>;
    } else {
        filmListsContent = (
            <div className="film-list-popup">
                {isCreating && (
                    <div className="array-editor-row film-list-row">
                        <TextInput
                            id="film-list-name"
                            ariaLabel="film list name"
                            value={filmListName}
                            maxLength={255}
                            placeholder="Film list name"
                            regex={INPUT_RULES.title}
                            disabled={createFilmList.isPending}
                            onChange={setFilmListName}
                            onEnter={handleCreate}
                        />
                        <button
                            title="Save"
                            onClick={handleCreate}
                            disabled={!filmListName.trim() || createFilmList.isPending}
                        >
                            ✔
                        </button>
                        <button
                            title="Cancel"
                            onClick={resetCreateForm}
                            disabled={createFilmList.isPending}
                        >
                            ✖
                        </button>
                    </div>
                )}

                {filmLists.map((filmList) => (
                    <div key={filmList.id} className="array-editor-row film-list-row">
                        {editingFilmList?.id === filmList.id ? (
                            <>
                                <TextInput
                                    id={`film-list-${filmList.id}`}
                                    ariaLabel={`edit film list ${filmList.name}`}
                                    value={form.name}
                                    maxLength={255}
                                    placeholder="Film list name"
                                    regex={INPUT_RULES.title}
                                    disabled={updateFilmList.isPending}
                                    onChange={(name) => setForm({name})}
                                    onEnter={handleUpdate}
                                />
                                <button
                                    title="Save"
                                    onClick={handleUpdate}
                                    disabled={
                                        !form.name.trim() ||
                                        form.name.trim() === filmList.name.trim() ||
                                        updateFilmList.isPending
                                    }
                                >
                                    ✔
                                </button>
                                <button
                                    title="Cancel"
                                    onClick={resetEditForm}
                                    disabled={updateFilmList.isPending}
                                >
                                    ✖
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="list-item-button"
                                    onClick={() => navigateToFilmList(filmList.id)}
                                >
                                    <span className="film-list-item-name">{filmList.name}</span>
                                    <span className="item-label">{filmList.filmIds.length}</span>
                                </button>
                                <button
                                    title="rename"
                                    onClick={() => startEditing(filmList)}
                                    disabled={updateFilmList.isPending || deleteFilmList.isPending}
                                >
                                    ✎
                                </button>
                                <button
                                    title="delete"
                                    onClick={() => handleDelete(filmList.id)}
                                    disabled={updateFilmList.isPending || deleteFilmList.isPending}
                                >
                                    🗑
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="filter-overlay">
            <button
                className="popup-backdrop-button"
                aria-label="Close film lists"
                title="Close"
                onClick={closePopup}
            />
            <div className="filter-popup" role="dialog" aria-label="Film lists">
                <div className="filter-section-header">
                    <span>Custom lists</span>
                    <button
                        title="Create new list"
                        onClick={startCreating}
                        disabled={isCreating || isLoading || !!error || createFilmList.isPending}
                    >
                        ✚
                    </button>
                </div>

                {filmListsContent}

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
