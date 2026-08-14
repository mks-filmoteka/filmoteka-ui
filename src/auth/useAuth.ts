import {keycloak} from "./keycloak.ts";


export function useAuth() {
    return {
        authenticated: keycloak.authenticated,
        isUser: keycloak.hasRealmRole("USER"),
        isAdmin: keycloak.hasRealmRole("ADMIN"),
    };
}