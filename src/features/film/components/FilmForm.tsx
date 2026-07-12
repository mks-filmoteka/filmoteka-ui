import type {FilmRequest} from "../types/filmRequest.ts";
import React from "react";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import {type Genre, GENRES} from "../types/genre.ts";
import {YEARS} from "../constants/constants.ts";
import {COUNTRIES, type Country} from "../types/country.ts";
import type {ApiError} from "../../../shared/types/ApiError.ts";
import PosterUpload from "../../media/components/PosterUpload.tsx";

type Props = {
    form: FilmRequest;
    setForm: React.Dispatch<React.SetStateAction<FilmRequest>>;
    onCancel: () => void;
    onSave: () => void;
    apiError?: ApiError | Error;
    isPending?: boolean;
    isChanged?: boolean;
    posterFile: File | null;
    setPosterFile: (file: File | null) => void;
};
type ArrayField = "actors" | "directors" | "genres" | "countries";
type ArrayFieldValue = string | Genre | Country;

export function FilmForm(props: Readonly<Props>) {
    const {form, setForm, onSave, onCancel, apiError, isPending, isChanged, posterFile, setPosterFile} = props;

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
                    param = GENRES.find(g => !form.genres.includes(g));
                } else if (type === "countries") {
                    param = COUNTRIES.find(g => !form.countries.includes(g));
                } else param = {name: ""};
                return {
                    ...prev,
                    [type]: [...prev[type], param]
                };
            });
        };

    const isInvalid =
        !form.title.trim() ||
        !form.description.trim() ||
        form.releaseYear < 1888 || form.releaseYear > 2100 ||
        form.actors.length === 0 || form.directors.length === 0 || form.genres.length === 0 ||
        form.actors.some(a => !a.name.trim()) ||
        form.directors.some(d => !d.name.trim());

    return (
        <>
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
                        <button onClick={onSave} disabled={!(isChanged ?? true) || isPending || isInvalid}>
                            ✔
                        </button>

                        <button onClick={onCancel}>
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
                        disabled={isPending}
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
                                        {YEARS.map(y => (
                                            <option key={y} value={y}>
                                                {y}
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
                                            {COUNTRIES.map(g => (
                                                <option
                                                    key={g}
                                                    value={g}
                                                    disabled={form.countries.includes(g)}
                                                >
                                                    {g}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => removeItem("countries", index)}
                                        >
                                            ✖
                                        </button>

                                    </div>
                                ))}

                                {form.countries.length < 5 && (
                                    <button onClick={() => addItem("countries")}>
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
                                            {GENRES.map(g => (
                                                <option
                                                    key={g}
                                                    value={g}
                                                    disabled={form.genres.includes(g)}
                                                >
                                                    {g}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => removeItem("genres", index)}
                                        >
                                            ✖
                                        </button>

                                    </div>
                                ))}

                                {form.genres.length < 5 && (
                                    <button onClick={() => addItem("genres")}>
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
                                            onClick={() => removeItem("directors", index)}
                                            disabled={form.directors.length <= 1}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                ))}
                                {form.directors.length < 5 && (
                                    <button onClick={() => addItem("directors")}>
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
                                        onClick={() => removeItem("actors", index)}
                                        disabled={form.actors.length <= 1}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                            {form.actors.length < 20 && (
                                <button onClick={() => addItem("actors")}>
                                    + Add actor
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
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
        </>
    );
}
