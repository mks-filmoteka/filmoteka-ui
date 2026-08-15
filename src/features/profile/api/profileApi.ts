import {userClient} from "../../../shared/api/client.ts";
import type {UserProfile} from "../types/userProfile.ts";
import type {UserProfileRequest} from "../types/userProfileRequest.ts";

export async function getProfile() {
    const response = await userClient.get<UserProfile>("/profile");
    return response.data;
}

export async function updateProfile(request: UserProfileRequest) {
    const response = await userClient.put<UserProfile>("/profile", request);
    return response.data;
}