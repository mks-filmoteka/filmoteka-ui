import {beforeEach, describe, expect, it, vi, type Mock} from "vitest";
import {userClient} from "../../../shared/api/client.ts";
import type {UserProfile} from "../types/userProfile.ts";
import type {UserProfileRequest} from "../types/userProfileRequest.ts";
import {getProfile, updateProfile} from "./profileApi.ts";

vi.mock("../../../shared/api/client.ts", () => ({
    userClient: {
        get: vi.fn(),
        put: vi.fn()
    }
}));

const mockedUserClient = userClient as unknown as {
    get: Mock;
    put: Mock;
};

const profile: UserProfile = {
    email: "test@example.com",
    displayName: "Test User"
};

const request: UserProfileRequest = {
    displayName: "Updated Test User"
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("profileApi", () => {
    it("unwraps profile responses from the expected endpoint", async () => {
        mockedUserClient.get.mockResolvedValue({data: profile});

        await expect(getProfile()).resolves.toBe(profile);

        expect(mockedUserClient.get).toHaveBeenCalledWith("/profile");
    });

    it("sends update requests to the expected profile endpoint", async () => {
        mockedUserClient.put.mockResolvedValue({data: profile});

        await expect(updateProfile(request)).resolves.toBe(profile);

        expect(mockedUserClient.put).toHaveBeenCalledWith("/profile", request);
    });
});
