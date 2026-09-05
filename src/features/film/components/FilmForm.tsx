import { type ChangeEvent, type SubmitEvent as ReactSubmitEvent, useState } from "react";
import { TextInput } from "../../../shared/components/TextInput.tsx";
import { ApiErrorMessage } from "../../../shared/components/ApiErrorMessage.tsx";
import type { ApiError } from "../../../shared/types/ApiError.ts";
import { getApiError } from "../../../shared/api/apiError.ts";
import { INPUT_RULES } from "../../../shared/utils/inputValidation.ts";
import PosterUpload from "../../media/components/PosterUpload.tsx";
import { useDeleteFile } from "../../media/queries/useDeleteFile.ts";
import { useUploadFile } from "../../media/queries/useUploadFile.ts";
import { COUNTRIES } from "../types/country.ts";
import type { Film } from "../types/film.ts";
import type { FilmRequest } from "../types/filmRequest.ts";
import { GENRES } from "../types/genre.ts";
import { fillRequest } from "../utils/formState.ts";
import { PersonNameArrayField, ReleaseYearField, SelectArrayField } from "./FilmFormFields.tsx";
import { useFilmFormState } from "../queries/useFilmFormState.ts";
import { IconButton } from "../../../shared/components/IconButton.tsx";

export type FilmFormSaveOptions = {
    onSuccess: () => void;
    onError: (error: Error) => void;
};

type Props = {
    confirmMessage: string;
    onCancel: () => void;
    onSave: (request: FilmRequest, options: FilmFormSaveOptions) => void;
    initialFilm?: Film;
    isPending?: boolean;
    isChanged: (form: FilmRequest, posterFile: File | null) => boolean;
};

export function FilmForm(props: Readonly<Props>) {
    const { confirmMessage, onCancel, onSave, initialFilm, isPending, isChanged } = props;
    const uploadPoster = useUploadFile();
    const deletePoster = useDeleteFile();
    const filmForm = useFilmFormState(initialFilm);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [apiError, setApiError] = useState<ApiError | Error>();
    const pending = !!isPending || uploadPoster.isPending;
    const saveDisabled = !isChanged(filmForm.requestForm, posterFile) || pending || filmForm.isInvalid;

    const resetForm = () => {
        filmForm.resetForm();
        setPosterFile(null);
        setApiError(undefined);
    };

    const handleError = (error: Error, uploadedPosterName?: string) => {
        if (uploadedPosterName) {
            deletePoster.mutate(uploadedPosterName);
        }
        setApiError(getApiError(error));
    };

    const saveFilm = (request: FilmRequest, uploadedPosterName?: string) => {
        onSave(request, {
            onSuccess: resetForm,
            onError: (error: Error) => handleError(error, uploadedPosterName),
        });
    };

    const handleSubmit = (event: ReactSubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saveDisabled) return;
        if (!confirm(confirmMessage)) return;

        const request = fillRequest(filmForm.requestForm);
        if (!posterFile) {
            saveFilm(request);
            return;
        }

        uploadPoster.mutate(posterFile, {
            onSuccess: (uploadedPoster) => {
                saveFilm(
                    {
                        ...request,
                        posterName: uploadedPoster.fileName,
                    },
                    uploadedPoster.fileName,
                );
            },
            onError: (error: Error) => handleError(error),
        });
    };

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
        filmForm.setDescription(event.target.value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="page-title">
                <h1>
                    <TextInput
                        id="form-title"
                        ariaLabel="form title"
                        value={filmForm.form.title}
                        maxLength={255}
                        onChange={filmForm.setTitle}
                        regex={INPUT_RULES.title}
                        placeholder="title"
                    />
                    ({filmForm.form.releaseYear})
                </h1>
                <div>
                    <div>{filmForm.requestForm.genres[0] ?? ""}</div>
                    <div className="page-title-controls">
                        <IconButton type="submit" icon="accept" label="Save film" disabled={saveDisabled} />
                        <IconButton icon="cancel" label="Cancel film" onClick={handleCancel} />
                    </div>
                </div>
            </div>

            <hr />

            <div className="main-grid">
                <div>
                    <PosterUpload
                        value={filmForm.form.posterName}
                        alt={filmForm.form.title || "Film poster"}
                        onChange={filmForm.setPosterName}
                        posterFile={posterFile}
                        setPosterFile={setPosterFile}
                        disabled={pending}
                    />
                </div>

                <div>
                    <p>
                        <textarea
                            id="form-description"
                            aria-label="form description"
                            value={filmForm.form.description}
                            maxLength={1000}
                            onChange={handleDescriptionChange}
                            placeholder="description"
                        />
                    </p>

                    <div className="details-column">
                        <ReleaseYearField value={filmForm.form.releaseYear} onChange={filmForm.setReleaseYear} />

                        <SelectArrayField
                            label="Country"
                            rows={filmForm.form.countries}
                            options={COUNTRIES}
                            addLabel="+ Add country"
                            maxRows={5}
                            onAdd={filmForm.addCountry}
                            onChange={filmForm.updateCountry}
                            onRemove={filmForm.removeCountry}
                        />

                        <SelectArrayField
                            label="Genre"
                            rows={filmForm.form.genres}
                            options={GENRES}
                            addLabel="+ Add genre"
                            maxRows={5}
                            onAdd={filmForm.addGenre}
                            onChange={filmForm.updateGenre}
                            onRemove={filmForm.removeGenre}
                        />

                        <div>
                            <span>Director</span>
                            <PersonNameArrayField
                                rows={filmForm.form.directors}
                                inputIdPrefix="director"
                                ariaLabelPrefix="director"
                                placeholder="Director name"
                                addLabel="+ Add director"
                                maxRows={5}
                                onAdd={filmForm.addDirector}
                                onChange={filmForm.updateDirector}
                                onRemove={filmForm.removeDirector}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <p>
                        <span>Cast</span>
                    </p>
                    <div className="people-column">
                        <PersonNameArrayField
                            rows={filmForm.form.actors}
                            inputIdPrefix="actor"
                            ariaLabelPrefix="actor"
                            placeholder="Actor name"
                            addLabel="+ Add actor"
                            maxRows={20}
                            onAdd={filmForm.addActor}
                            onChange={filmForm.updateActor}
                            onRemove={filmForm.removeActor}
                        />
                    </div>
                </div>
            </div>
            <ApiErrorMessage error={apiError} />
        </form>
    );
}
