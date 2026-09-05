import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../auth/useAuth.ts";
import { getProfile } from "../api/profileApi.ts";

export function useProfile() {
    const { authenticated } = useAuth();

    return useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        enabled: authenticated,
    });
}
