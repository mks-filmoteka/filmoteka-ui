import {describe, expect, it} from "vitest";
import type {Film} from "../types/film";
import type {FilmRequest} from "../types/filmRequest";
import {fillForm, fillRequest, isFormChanged} from "./formState";

const film: Film = {
    id: 1,
    title: "Test Title",
    releaseYear: 2000,
    countries: ["Poland", "France"],
    description: "Test description",
    posterName: "test-poster.jpg",
    genres: ["Drama", "Action"],
    actors: [
        {id: 1, name: "Test Actor"},
        {id: 2, name: "Second Test Actor"}
    ],
    directors: [{id: 3, name: "Test Director"}]
};

describe("formState", () => {
    it("fills an empty form when no film data is available", () => {
        expect(fillForm()).toEqual({
            title: "",
            releaseYear: 0,
            countries: [],
            description: "",
            posterName: null,
            genres: [],
            actors: [],
            directors: []
        });
    });

    it("maps film data into the editable request", () => {
        expect(fillForm(film)).toEqual({
            title: film.title,
            releaseYear: film.releaseYear,
            countries: film.countries,
            description: film.description,
            posterName: film.posterName,
            genres: film.genres,
            actors: [{name: "Test Actor"}, {name: "Second Test Actor"}],
            directors: [{name: "Test Director"}]
        });
    });

    it("trims text fields, removes duplicate filters, drops empty people", () => {
        const form: FilmRequest = {
            title: "  Test Title  ",
            releaseYear: 2000,
            countries: ["Poland", "France", "Poland"],
            description: "  Test description  ",
            posterName: "  test-poster.jpg  ",
            genres: ["Drama", "Action", "Drama"],
            actors: [{name: "  Test Actor  "}, {name: "   "}],
            directors: [{name: "  Test Director  "}, {name: ""}]
        };

        expect(fillRequest(form)).toEqual({
            title: "Test Title",
            releaseYear: 2000,
            countries: ["Poland", "France"],
            description: "Test description",
            posterName: "test-poster.jpg",
            genres: ["Drama", "Action"],
            actors: [{name: "Test Actor"}],
            directors: [{name: "Test Director"}]
        });
    });

    it("detects whether a populated form changed from the original film", () => {
        const unchanged = fillForm(film);
        const changed = {...unchanged, title: "Changed title"};

        expect(isFormChanged(unchanged, film)).toBe(false);
        expect(isFormChanged(changed, film)).toBe(true);
        expect(isFormChanged(changed)).toBe(false);
    });
});
