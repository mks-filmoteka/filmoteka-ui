import {useMutation, useQueryClient} from "@tanstack/react-query";
import {updateProfile} from "../api/profileApi.ts";
import type {UserProfile} from "../types/userProfile.ts";
import type {UserProfileRequest} from "../types/userProfileRequest.ts";

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: UserProfileRequest) =>
            updateProfile(request),
        onSuccess: (profile: UserProfile) => {
            queryClient.setQueryData(["profile"], profile);
        }
    });
}
