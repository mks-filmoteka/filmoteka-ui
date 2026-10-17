import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { catalogClient } from "../../../shared/api/client";
import type { PersonRequest } from "../types/personRequest";
import { deletePerson, getPersonById, updatePerson } from "./personApi";
import { testPerson } from "../../../test/testData";

vi.mock("../../../shared/api/client", () => ({
    catalogClient: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

const mockedApiClient = catalogClient as unknown as {
    get: Mock;
    put: Mock;
    delete: Mock;
};

const person = testPerson();

const request: PersonRequest = {
    name: "Updated Test Person",
    birthDate: null,
    deathDate: null,
    placeOfBirth: null,
    photoName: null,
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("personApi", () => {
    it("loads a person from the people endpoint", async () => {
        mockedApiClient.get.mockResolvedValue({ data: person });

        await expect(getPersonById(1)).resolves.toBe(person);

        expect(mockedApiClient.get).toHaveBeenCalledWith("/people/1");
    });

    it("sends update requests to the people endpoint", async () => {
        mockedApiClient.put.mockResolvedValue({ data: person });

        await expect(updatePerson(1, request)).resolves.toBe(person);

        expect(mockedApiClient.put).toHaveBeenCalledWith("/people/1", request);
    });

    it("deletes a person through the people endpoint", async () => {
        mockedApiClient.delete.mockResolvedValue({});

        await deletePerson(1);

        expect(mockedApiClient.delete).toHaveBeenCalledWith("/people/1");
    });
});
