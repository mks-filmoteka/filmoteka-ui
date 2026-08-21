import {beforeEach, describe, expect, it, vi, type Mock} from "vitest";
import {userClient} from "../../../shared/api/client.ts";
import type {Collection} from "../types/collection.ts";
import type {CollectionRequest} from "../types/collectionRequest.ts";
import {
    addFilm,
    createCollection,
    deleteCollection,
    getCollection,
    getCollections,
    removeFilm,
    updateCollection
} from "./collectionApi.ts";

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

const collection: Collection = {
    id: "1",
    name: "Favorites",
    filmIds: [1, 2]
};

const request: CollectionRequest = {
    name: "Favorites"
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("collectionApi", () => {
    it("returns collections", async () => {
        const collections = [collection];
        mockedUserClient.get.mockResolvedValue({data: collections});

        await expect(getCollections()).resolves.toBe(collections);

        expect(mockedUserClient.get).toHaveBeenCalledWith("/film-lists");
    });

    it("returns a collection by id", async () => {
        mockedUserClient.get.mockResolvedValue({data: collection});

        await expect(getCollection("1")).resolves.toBe(collection);

        expect(mockedUserClient.get).toHaveBeenCalledWith("/film-lists/1");
    });

    it("sends create and update requests to the expected endpoints", async () => {
        mockedUserClient.post.mockResolvedValue({data: collection});
        mockedUserClient.put.mockResolvedValue({data: collection});

        await expect(createCollection(request)).resolves.toBe(collection);
        await expect(updateCollection("1", request)).resolves.toBe(collection);

        expect(mockedUserClient.post).toHaveBeenCalledWith("/film-lists", request);
        expect(mockedUserClient.put).toHaveBeenCalledWith("/film-lists/1", request);
    });

    it("deletes a collection by id", async () => {
        mockedUserClient.delete.mockResolvedValue({data: {deleted: true}});

        await expect(deleteCollection("1")).resolves.toBeUndefined();

        expect(mockedUserClient.delete).toHaveBeenCalledWith("/film-lists/1");
    });

    it("adds a film to a collection", async () => {
        mockedUserClient.post.mockResolvedValue({data: collection});

        await expect(addFilm("1", "2")).resolves.toBe(collection);

        expect(mockedUserClient.post).toHaveBeenCalledWith("/film-lists/1/films/2");
    });

    it("removes a film from a collection", async () => {
        mockedUserClient.delete.mockResolvedValue({data: collection});

        await expect(removeFilm("1", "2")).resolves.toBe(collection);

        expect(mockedUserClient.delete).toHaveBeenCalledWith("/film-lists/1/films/2");
    });
});
