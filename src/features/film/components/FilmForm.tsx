import type {AxiosError} from "axios";
import {type SubmitEvent as ReactSubmitEvent, useState} from "react";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import PosterUpload from "../../media/components/PosterUpload.tsx";
import {useDeleteFile} from "../../media/queries/useDeleteFile.ts";
import {useUploadFile} from "../../media/queries/useUploadFile.ts";
import {YEARS} from "../constants/constants.ts";
import {COUNTRIES, type Country} from "../types/country.ts";
import type {Film} from "../types/film.ts";
import type {FilmRequest} from "../types/filmRequest.ts";
import {GENRES, type Genre} from "../types/genre.ts";
import {fillForm, fillRequest} from "../utils/formState.ts";

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

type ArrayField = "actors" | "directors" | "genres" | "countries";
type ArrayFieldValue = string | Genre | Country;

function isFormInvalid(form: FilmRequest) {
    return !form.title.trim() ||
        !form.description.trim() ||
        form.releaseYear < 1888 || form.releaseYear > 2100 ||
        form.actors.length === 0 || form.directors.length === 0 || form.genres.length === 0 ||
        form.actors.some(actor => !actor.name.trim()) ||
        form.directors.some(director => !director.name.trim());
}

export function FilmForm(props: Readonly<Props>) {
    const {confirmMessage, onCancel, onSave, initialFilm, isPending, isChanged} = props;
    const uploadPoster = useUploadFile();
    const deletePoster = useDeleteFile();
    const [form, setForm] = useState<FilmRequest>(() => fillForm(initialFilm));
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [apiError, setApiError] = useState<ApiError | Error>();

    const updateItem =
        (type: ArrayField, index: number, value: ArrayFieldValue) => {
            setForm(prev => ({
                ...prev,
                [type]: prev[type].map((item, i) => {
                    if (i !== index) {
                        return item;
                    }
                    if (type === "genres" || type === "countries") {
                        return value;
                    }
                    return {name: value};
                })
            }));
        };

    const removeItem =
        (type: ArrayField, index: number) => {
            setForm(prev => ({
                ...prev,
                [type]: prev[type].filter((_, i) => i !== index)
            }));
        };

    const addItem =
        (type: ArrayField) => {
            setForm(prev => {
                let param;
                if (type === "genres") {
                    param = GENRES.find(genre => !prev.genres.includes(genre));
                } else if (type === "countries") {
                    param = COUNTRIES.find(country => !prev.countries.includes(country));
                } else param = {name: ""};

                if (!param) {
                    return prev;
                }
                return {
                    ...prev,
                    [type]: [...prev[type], param]
                };
            });
        };

    const resetForm = () => {
        setForm(fillForm(initialFilm));
        setPosterFile(null);
        setApiError(undefined);
    };

    const handleError = (error: Error, uploadedPosterName?: string) => {
        if (uploadedPosterName) {
            deletePoster.mutate(uploadedPosterName);
        }
        const err = error as AxiosError<ApiError>;
        setApiError(err.response?.data ?? error);
    };

    const saveFilm = (request: FilmRequest, uploadedPosterName?: string) => {
        onSave(request, {
            onSuccess: resetForm,
            onError: (error: Error) => handleError(error, uploadedPosterName)
        });
    };

    const pending = !!isPending || uploadPoster.isPending;
    const saveDisabled = !isChanged(form, posterFile) || pending || isFormInvalid(form);

    const handleSubmit = (event: ReactSubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saveDisabled) return;
        if (!confirm(confirmMessage)) return;

        const request = fillRequest(form);
        if (!posterFile) {
            saveFilm(request);
            return;
        }

        uploadPoster.mutate(
            posterFile,
            {
                onSuccess: (uploadedPoster) => {
                    saveFilm({
                        ...request,
                        posterName: uploadedPoster.fileName
                    }, uploadedPoster.fileName);
                },
                onError: (error: Error) => handleError(error)
            }
        );
    };

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="page-title">
                <h1>
                    <TextInput
                        id={"form-title"}
                        ariaLabel="form title"
                        value={form.title}
                        maxLength={255}
                        onChange={(value) =>
                            setForm(prev => ({
                                ...prev,
                                title: value
                            }))
                        }
                        regex={INPUT_RULES.title}
                        placeholder="title"
                    />({form.releaseYear})
                </h1>
                <div>
                    <div>{form.genres[0] ?? ""}</div>
                    <div className="page-title-controls">
                        <button
                            type="submit"
                            title="Save film"
                            disabled={saveDisabled}
                        >
                            ✔
                        </button>
                        <button
                            type="button"
                            title="Cancel film"
                            onClick={handleCancel}
                        >
                            ✖
                        </button>
                    </div>
                </div>
            </div>

            <hr />

            <div className="main-grid">
                <div>
                    <PosterUpload
                        value={form.posterName}
                        alt={form.title || "Film poster"}
                        onChange={(posterName) =>
                            setForm(prev => ({
                                ...prev,
                                posterName,
                            }))
                        }
                        posterFile={posterFile}
                        setPosterFile={setPosterFile}
                        disabled={pending}
                    />
                </div>

                <div>
                    <p>
                        <textarea
                            id={"form-description"}
                            aria-label="form description"
                            value={form.description}
                            maxLength={1000}
                            onChange={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                                setForm(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))
                            }}
                            placeholder="description"
                        />
                    </p>

                    <div className="details-column">
                        <div>
                            <span>Year</span>
                            <div className="array-editor">
                                <div className="array-editor-row">
                                    <select
                                        value={form.releaseYear}
                                        onChange={(e) =>
                                            setForm(prev => ({
                                                ...prev,
                                                releaseYear: Number(e.target.value)
                                            }))
                                        }
                                    >
                                        <option value={0} disabled>
                                            select
                                        </option>
                                        {YEARS.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span>Country</span>
                            <div className="array-editor">
                                {form.countries.map((country, index) => (
                                    <div key={index} className="array-editor-row">
                                        <select
                                            value={country}
                                            onChange={(e) =>
                                                updateItem("countries", index, e.target.value)
                                            }
                                        >
                                            {COUNTRIES.map(option => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                    disabled={form.countries.includes(option)}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => removeItem("countries", index)}
                                        >
                                            ✖
                                        </button>

                                    </div>
                                ))}

                                {form.countries.length < 5 && (
                                    <button type="button" onClick={() => addItem("countries")}>
                                        + Add country
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <span>Genre</span>
                            <div className="array-editor">
                                {form.genres.map((genre, index) => (
                                    <div key={index} className="array-editor-row">
                                        <select
                                            value={genre}
                                            onChange={(e) =>
                                                updateItem("genres", index, e.target.value)
                                            }
                                        >
                                            {GENRES.map(option => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                    disabled={form.genres.includes(option)}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => removeItem("genres", index)}
                                        >
                                            ✖
                                        </button>

                                    </div>
                                ))}

                                {form.genres.length < 5 && (
                                    <button type="button" onClick={() => addItem("genres")}>
                                        + Add genre
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <span>Director</span>

                            <div className="array-editor">
                                {form.directors.map((director, index) => (
                                    <div key={index} className="array-editor-row">
                                        <TextInput
                                            id={`director-${index}`}
                                            ariaLabel={`director ${index}`}
                                            value={director.name}
                                            maxLength={100}
                                            placeholder={"Director name"}
                                            regex={INPUT_RULES.name}
                                            onChange={(value) =>
                                                updateItem("directors", index, value)
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeItem("directors", index)}
                                            disabled={form.directors.length <= 1}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                ))}
                                {form.directors.length < 5 && (
                                    <button type="button" onClick={() => addItem("directors")}>
                                        + Add director
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <p><span>Cast</span></p>
                    <div className="people-column">
                        <div className="array-editor">
                            {form.actors.map((actor, index) => (
                                <div key={index} className="array-editor-row">
                                    <TextInput
                                        id={`actor-${index}`}
                                        ariaLabel={`actor ${index}`}
                                        value={actor.name}
                                        maxLength={100}
                                        placeholder={"Actor name"}
                                        regex={INPUT_RULES.name}
                                        onChange={(value) =>
                                            updateItem("actors", index, value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem("actors", index)}
                                        disabled={form.actors.length <= 1}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                            {form.actors.length < 20 && (
                                <button type="button" onClick={() => addItem("actors")}>
                                    + Add actor
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {apiError && (
                <div style={{color: "red"}}>
                    <div>{apiError.message}</div>
                    <div>
                        {"errorDetails" in apiError && apiError.errorDetails?.map((detail) => (
                            <div key={detail.field}>{detail.field}: {detail.message}</div>
                        ))}
                    </div>
                </div>
            )}
        </form>
    );
}
