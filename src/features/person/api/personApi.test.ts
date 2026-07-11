import {beforeEach, describe, expect, it, vi, type Mock} from "vitest";
import {apiClient} from "../../../shared/api/client";
import type {Person} from "../types/person";
import type {PersonRequest} from "../types/personRequest";
import {getPersonById, updatePerson} from "./personApi";

vi.mock("../../../shared/api/client", () => ({
    apiClient: {
        get: vi.fn(),
        put: vi.fn()
    }
}));

const mockedApiClient = apiClient as unknown as {
    get: Mock;
    put: Mock;
};

const person: Person = {
    id: 1,
    name: "Test Person",
    films: [{
        id: 1,
        title: "Test Title",
        releaseYear: 2000,
        countries: ["Poland"],
        posterName: null,
        genres: ["Drama"]
    }]
};

const request: PersonRequest = {
    name: "Updated Test Person"
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("personApi", () => {
    it("unwraps actor and director responses from the expected endpoints", async () => {
        mockedApiClient.get.mockResolvedValue({data: person});

        await expect(getPersonById("actor", "1")).resolves.toBe(person);
        await expect(getPersonById("director", "1")).resolves.toBe(person);

        expect(mockedApiClient.get).toHaveBeenNthCalledWith(1, "/actors/1");
        expect(mockedApiClient.get).toHaveBeenNthCalledWith(2, "/directors/1");
    });

    it("sends update requests to the expected person endpoint", async () => {
        mockedApiClient.put.mockResolvedValue({data: person});

        await expect(updatePerson("actor", "1", request)).resolves.toBe(person);

        expect(mockedApiClient.put).toHaveBeenCalledWith("/actors/1", request);
    });
});
