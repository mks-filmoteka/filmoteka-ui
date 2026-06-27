import type {FilmRequest} from "../types/filmRequest.ts";
import React from "react";
import {formatParam} from "../utils/format.ts";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import {type Genre, GENRES} from "../types/genre.ts";
import {YEARS} from "../constants/constants.ts";
import {COUNTRIES} from "../types/country.ts";

type Props = {
    form: FilmRequest;
    setForm: React.Dispatch<React.SetStateAction<FilmRequest>>;
    onCancel: () => void;
    onSave: () => void;
    isPending?: boolean;
    isChanged?: boolean;
};

export function FilmForm(props: Readonly<Props>) {
    const {form, setForm, onSave, onCancel, isPending, isChanged} = props;

    const updateItem =
        (type: "actors" | "directors" | "genres" , index: number, value: string | Genre ) => {
            setForm(prev => ({
                ...prev,
                [type]: prev[type].map((item, i) =>
                    i === index ? type === "genres" ? value : {name: value} : item
                )
            }));
    };

    const removeItem =
        (type: "actors" | "directors" | "genres" , index: number) => {
            setForm(prev => ({
                ...prev,
                [type]: prev[type].filter((_, i) => i !== index)
            }));
        };

    const addItem =
        (type: "actors" | "directors" | "genres") => {
            setForm(prev => ({
                ...prev,
                [type]: [...prev[type], type === "genres"
                    ? GENRES.find(g => !form.genres.includes(g))
                    : {name: ""}]
            }));
        };

    const isInvalid =
        !form.country.trim() ||
        !form.description.trim() ||
        form.releaseYear < 1888 || form.releaseYear > 2100 ||
        form.actors.some(a => !a.name.trim()) ||
        form.directors.some(d => !d.name.trim());

    return (
        <>
            <div className="page-title">
                <h1>
                    <TextInput
                        id={"form-title"}
                        aria-label="form title"
                        value={form.title}
                        maxLength={255}
                        onChange={(value) =>
                            setForm(prev => ({
                                ...prev,
                                title: value
                            }))
                        }
                        regex={INPUT_RULES.title}
                        placeholder="Edit title"
                    />({form.releaseYear})
                </h1>

                <div>
                    <div>{formatParam(form.genres[0] ?? "")}</div>
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
                    <TextInput
                        id={"form-poster"}
                        aria-label="form poster"
                        value={form.posterUrl}
                        onChange={(value) =>
                            setForm(prev => ({
                                ...prev,
                                posterUrl: value
                            }))
                        }
                        placeholder="Edit poster"
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
                            placeholder="Edit description"
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
                                <div className="array-editor-row">
                                    <select
                                        value={form.country}
                                        onChange={(e) =>
                                            setForm(prev => ({
                                                ...prev,
                                                country: e.target.value
                                            }))
                                        }
                                    >
                                        {COUNTRIES.map(c => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                                    {formatParam(g)}
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
        </>
    );
}