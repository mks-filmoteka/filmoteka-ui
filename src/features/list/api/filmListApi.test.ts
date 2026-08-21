import {beforeEach, describe, expect, it, vi, type Mock} from "vitest";
import {userClient} from "../../../shared/api/client.ts";
import type {FilmList} from "../types/filmList.ts";
import type {FilmListRequest} from "../types/filmListRequest.ts";
import {
    addFilm,
    createFilmList,
    deleteFilmList,
    getFilmList,
    getFilmLists,
    removeFilm,
    updateFilmList
} from "./filmListApi.ts";

vi.mock("../../../shared/api/client.ts", () => ({
    userClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

const mockedUserClient = userClient as unknown as {
    get: Mock;
    post: Mock;
    put: Mock;
    delete: Mock;
};

const filmList: FilmList = {
    id: "1",
    name: "Favorites",
    filmIds: [1, 2]
};

const request: FilmListRequest = {
    name: "Favorites"
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("filmListApi", () => {
    it("returns film lists", async () => {
        const filmLists = [filmList];
        mockedUserClient.get.mockResolvedValue({data: filmLists});

        await expect(getFilmLists()).resolves.toBe(filmLists);

        expect(mockedUserClient.get).toHaveBeenCalledWith("/film-lists");
    });

    it("returns a film list by id", async () => {
        mockedUserClient.get.mockResolvedValue({data: filmList});

        await expect(getFilmList("1")).resolves.toBe(filmList);

        expect(mockedUserClient.get).toHaveBeenCalledWith("/film-lists/1");
    });

    it("sends create and update requests to the expected endpoints", async () => {
        mockedUserClient.post.mockResolvedValue({data: filmList});
        mockedUserClient.put.mockResolvedValue({data: filmList});

        await expect(createFilmList(request)).resolves.toBe(filmList);
        await expect(updateFilmList("1", request)).resolves.toBe(filmList);

        expect(mockedUserClient.post).toHaveBeenCalledWith("/film-lists", request);
        expect(mockedUserClient.put).toHaveBeenCalledWith("/film-lists/1", request);
    });

    it("deletes a film list by id", async () => {
        mockedUserClient.delete.mockResolvedValue({data: {deleted: true}});

        await expect(deleteFilmList("1")).resolves.toBeUndefined();

        expect(mockedUserClient.delete).toHaveBeenCalledWith("/film-lists/1");
    });

    it("adds a film to a list", async () => {
        mockedUserClient.post.mockResolvedValue({data: filmList});

        await expect(addFilm("1", "2")).resolves.toBe(filmList);

        expect(mockedUserClient.post).toHaveBeenCalledWith("/film-lists/1/films/2");
    });

    it("removes a film from a list", async () => {
        mockedUserClient.delete.mockResolvedValue({data: filmList});

        await expect(removeFilm("1", "2")).resolves.toBe(filmList);

        expect(mockedUserClient.delete).toHaveBeenCalledWith("/film-lists/1/films/2");
    });
});
