import {useQuery} from "@tanstack/react-query";
import {keycloak} from "../../../auth/keycloak.ts";
import {getProfile} from "../api/profileApi.ts";


export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
        enabled: keycloak.authenticated,
    });
}