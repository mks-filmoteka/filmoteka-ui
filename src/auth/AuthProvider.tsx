import {useEffect, useState, type ReactNode} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {initializeKeycloak, keycloak} from "./keycloak.ts";
import {AuthContext, type AuthState} from "./authContext.ts";

interface AuthProviderProps {
    children: ReactNode;
}

function readAuthState(): AuthState {
    const authenticated = keycloak.authenticated;

    return {
        status: authenticated ? "authenticated" : "guest",
        authenticated,
        isUser: authenticated && keycloak.hasRealmRole("USER"),
        isAdmin: authenticated && keycloak.hasRealmRole("ADMIN"),
    };
}

export function AuthProvider({children}: Readonly<AuthProviderProps>) {
    const queryClient = useQueryClient();

    const [authState, setAuthState] = useState<AuthState>({
        status: "checking",
        authenticated: false,
        isUser: false,
        isAdmin: false,
    });

    useEffect(() => {
        let active = true;

        const synchronizeAuthState = () => {
            if (active) {
                setAuthState(readAuthState());
            }
        };

        const clearPrivateQueries = () => {
            queryClient.removeQueries({queryKey: ["profile"]});
            queryClient.removeQueries({queryKey: ["collections"]});
            queryClient.removeQueries({queryKey: ["collection"]});
            queryClient.removeQueries({
                queryKey: ["films", "collection"]
            });
        };

        const handleAuthenticationLost = () => {
            clearPrivateQueries();
            synchronizeAuthState();
        };

        const handleRefreshError = () => {
            keycloak.clearToken();
            handleAuthenticationLost();
        };

        keycloak.onAuthSuccess = synchronizeAuthState;
        keycloak.onAuthRefreshSuccess = synchronizeAuthState;
        keycloak.onAuthLogout = handleAuthenticationLost;
        keycloak.onAuthRefreshError = handleRefreshError;

        void initializeKeycloak()
            .then(synchronizeAuthState)
            .catch(error => {
                if (!active) {
                    return;
                }
                console.error("Keycloak initialization failed. Continuing as guest.", error);
                keycloak.clearToken();
                setAuthState({status: "unavailable", authenticated: false, isUser: false, isAdmin: false,});
            });

        return () => {
            active = false;

            keycloak.onAuthSuccess = undefined;
            keycloak.onAuthRefreshSuccess = undefined;
            keycloak.onAuthLogout = undefined;
            keycloak.onAuthRefreshError = undefined;
        };
    }, [queryClient]);

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
}