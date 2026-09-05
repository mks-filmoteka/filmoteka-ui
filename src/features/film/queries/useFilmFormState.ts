import { useState } from "react";
import { MAX_YEAR, MIN_YEAR } from "../constants/constants.ts";
import { COUNTRIES, type Country } from "../types/country.ts";
import type { Film } from "../types/film.ts";
import type { FilmRequest } from "../types/filmRequest.ts";
import { GENRES, type Genre } from "../types/genre.ts";
import { fillForm } from "../utils/formState.ts";
import type { PersonNameRow, SelectRow } from "../components/FilmFormFields.tsx";

type FilmFormState = {
    nextRowId: number;
    title: string;
    releaseYear: number;
    countries: SelectRow<Country>[];
    description: string;
    posterName?: string | null;
    genres: SelectRow<Genre>[];
    actors: PersonNameRow[];
    directors: PersonNameRow[];
};

function isFormInvalid(form: FilmRequest) {
    return (
        !form.title.trim() ||
        !form.description.trim() ||
        form.releaseYear < MIN_YEAR ||
        form.releaseYear > MAX_YEAR ||
        form.actors.length === 0 ||
        form.directors.length === 0 ||
        form.genres.length === 0 ||
        form.actors.some((actor) => !actor.name.trim()) ||
        form.directors.some((director) => !director.name.trim())
    );
}

function createSelectRows<T extends string>(values: T[], createRowId: () => string): SelectRow<T>[] {
    return values.map((value) => ({
        id: createRowId(),
        value,
    }));
}

function createPersonRows(values: { name: string }[], createRowId: () => string): PersonNameRow[] {
    return values.map(({ name }) => ({
        id: createRowId(),
        name,
    }));
}

function createFilmFormState(form: FilmRequest): FilmFormState {
    let nextRowId = 0;
    const createRowId = () => `film-form-row-${nextRowId++}`;
    const countries = createSelectRows(form.countries, createRowId);
    const genres = createSelectRows(form.genres, createRowId);
    const actors = createPersonRows(form.actors, createRowId);
    const directors = createPersonRows(form.directors, createRowId);

    return {
        nextRowId,
        title: form.title,
        releaseYear: form.releaseYear,
        countries,
        description: form.description,
        posterName: form.posterName,
        genres,
        actors,
        directors,
    };
}

function toFilmRequest(form: FilmFormState): FilmRequest {
    return {
        title: form.title,
        releaseYear: form.releaseYear,
        countries: form.countries.map((country) => country.value),
        description: form.description,
        posterName: form.posterName,
        genres: form.genres.map((genre) => genre.value),
        actors: form.actors.map((actor) => ({ name: actor.name })),
        directors: form.directors.map((director) => ({ name: director.name })),
    };
}

function createNextRowId(form: FilmFormState) {
    return `film-form-row-${form.nextRowId}`;
}

function updateSelectRows<T extends string>(rows: SelectRow<T>[], rowId: string, value: T): SelectRow<T>[] {
    return rows.map((row) => (row.id === rowId ? { ...row, value } : row));
}

function updatePersonRows(rows: PersonNameRow[], rowId: string, name: string): PersonNameRow[] {
    return rows.map((row) => (row.id === rowId ? { ...row, name } : row));
}

function removeRow<T extends { id: string }>(rows: T[], rowId: string): T[] {
    return rows.filter((row) => row.id !== rowId);
}

function firstAvailableOption<T extends string>(
    options: readonly T[],
    rows: ReadonlyArray<SelectRow<T>>,
): T | undefined {
    const selectedValues = new Set(rows.map((row) => row.value));
    return options.find((option) => !selectedValues.has(option));
}

export function useFilmFormState(initialFilm?: Film) {
    const createInitialForm = () => createFilmFormState(fillForm(initialFilm));
    const [form, setForm] = useState(createInitialForm);
    const requestForm = toFilmRequest(form);

    const resetForm = () => setForm(createInitialForm());

    const addCountry = () => {
        setForm((prev) => {
            const country = firstAvailableOption(COUNTRIES, prev.countries);
            if (!country) {
                return prev;
            }
            return {
                ...prev,
                nextRowId: prev.nextRowId + 1,
                countries: [...prev.countries, { id: createNextRowId(prev), value: country }],
            };
        });
    };

    const addGenre = () => {
        setForm((prev) => {
            const genre = firstAvailableOption(GENRES, prev.genres);
            if (!genre) {
                return prev;
            }
            return {
                ...prev,
                nextRowId: prev.nextRowId + 1,
                genres: [...prev.genres, { id: createNextRowId(prev), value: genre }],
            };
        });
    };

    return {
        form,
        requestForm,
        isInvalid: isFormInvalid(requestForm),
        resetForm,
        setTitle: (title: string) => setForm((prev) => ({ ...prev, title })),
        setReleaseYear: (releaseYear: number) => setForm((prev) => ({ ...prev, releaseYear })),
        setDescription: (description: string) => setForm((prev) => ({ ...prev, description })),
        setPosterName: (posterName?: string | null) => setForm((prev) => ({ ...prev, posterName })),
        addCountry,
        updateCountry: (rowId: string, country: Country) =>
            setForm((prev) => ({ ...prev, countries: updateSelectRows(prev.countries, rowId, country) })),
        removeCountry: (rowId: string) => setForm((prev) => ({ ...prev, countries: removeRow(prev.countries, rowId) })),
        addGenre,
        updateGenre: (rowId: string, genre: Genre) =>
            setForm((prev) => ({ ...prev, genres: updateSelectRows(prev.genres, rowId, genre) })),
        removeGenre: (rowId: string) => setForm((prev) => ({ ...prev, genres: removeRow(prev.genres, rowId) })),
        addDirector: () =>
            setForm((prev) => ({
                ...prev,
                nextRowId: prev.nextRowId + 1,
                directors: [...prev.directors, { id: createNextRowId(prev), name: "" }],
            })),
        updateDirector: (rowId: string, name: string) =>
            setForm((prev) => ({ ...prev, directors: updatePersonRows(prev.directors, rowId, name) })),
        removeDirector: (rowId: string) =>
            setForm((prev) => ({ ...prev, directors: removeRow(prev.directors, rowId) })),
        addActor: () =>
            setForm((prev) => ({
                ...prev,
                nextRowId: prev.nextRowId + 1,
                actors: [...prev.actors, { id: createNextRowId(prev), name: "" }],
            })),
        updateActor: (rowId: string, name: string) =>
            setForm((prev) => ({ ...prev, actors: updatePersonRows(prev.actors, rowId, name) })),
        removeActor: (rowId: string) => setForm((prev) => ({ ...prev, actors: removeRow(prev.actors, rowId) })),
    };
}
