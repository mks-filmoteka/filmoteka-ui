import {useEffect, useState, type ReactNode} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {keycloak} from "./keycloak.ts";
import {AuthContext, type AuthState} from "./authContext.ts";

interface AuthProviderProps {
    children: ReactNode;
}

function readAuthState(): AuthState {
    const authenticated = keycloak.authenticated;

    return {
        authenticated,
        isUser: authenticated && keycloak.hasRealmRole("USER"),
        isAdmin: authenticated && keycloak.hasRealmRole("ADMIN"),
    };
}

export function AuthProvider({children}: Readonly<AuthProviderProps>) {
    const queryClient = useQueryClient();
    const [authState, setAuthState] = useState(readAuthState);

    useEffect(() => {
        const synchronizeAuthState = () => {
            setAuthState(readAuthState());
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

        return () => {
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
