import {beforeEach, describe, expect, it, vi, type Mock} from "vitest";
import {apiClient} from "../../../shared/api/client";
import type {Film} from "../types/film";
import type {FilmRequest} from "../types/filmRequest";
import {createFilm, deleteFilm, getFilmById, getFilms, updateFilm} from "./filmApi";

vi.mock("../../../shared/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

const mockedApiClient = apiClient as unknown as {
    get: Mock;
    post: Mock;
    put: Mock;
    delete: Mock;
};

const film: Film = {
    id: 1,
    title: "Test Title",
    releaseYear: 2000,
    countries: ["Poland", "France"],
    description: "Test description",
    posterName: null,
    genres: ["Drama", "Action"],
    actors: [{id: 1, name: "Test Actor"}],
    directors: [{id: 2, name: "Test Director"}]
};

const request: FilmRequest = {
    title: film.title,
    releaseYear: film.releaseYear,
    countries: film.countries,
    description: film.description,
    posterName: film.posterName,
    genres: film.genres,
    actors: [{name: "Test Actor"}],
    directors: [{name: "Test Director"}]
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("filmApi", () => {
    it("requests filtered film pages with array params", async () => {
        const page = {
            content: [film],
            totalElements: 1,
            totalPages: 1,
            size: 20,
            page: 1
        };
        mockedApiClient.get.mockResolvedValue({data: page});

        await expect(getFilms(
            1,
            "Test Title",
            1990,
            2010,
            ["Drama"],
            ["Poland"],
            ["title,asc"]
        )).resolves.toBe(page);

        expect(mockedApiClient.get).toHaveBeenCalledWith("/films", {
            params: {
                page: 1,
                title: "Test Title",
                yearFrom: 1990,
                yearTo: 2010,
                genres: ["Drama"],
                countries: ["Poland"],
                sort: ["title,asc"]
            },
            paramsSerializer: {indexes: null}
        });
    });

    it("unwraps single film responses", async () => {
        mockedApiClient.get.mockResolvedValue({data: film});

        await expect(getFilmById("1")).resolves.toBe(film);

        expect(mockedApiClient.get).toHaveBeenCalledWith("/films/1");
    });

    it("sends create and update requests to the expected endpoints", async () => {
        mockedApiClient.post.mockResolvedValue({data: film});
        mockedApiClient.put.mockResolvedValue({data: film});

        await expect(createFilm(request)).resolves.toBe(film);
        await expect(updateFilm("1", request)).resolves.toBe(film);

        expect(mockedApiClient.post).toHaveBeenCalledWith("/films", request);
        expect(mockedApiClient.put).toHaveBeenCalledWith("/films/1", request);
    });

    it("deletes a film by id and returns the response body", async () => {
        mockedApiClient.delete.mockResolvedValue({data: {deleted: true}});

        await expect(deleteFilm("1")).resolves.toEqual({deleted: true});

        expect(mockedApiClient.delete).toHaveBeenCalledWith("/films/1");
    });
});
