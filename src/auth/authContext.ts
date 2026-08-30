import {createContext} from "react";

export type AuthStatus = "checking" | "authenticated" | "guest" | "unavailable";

export interface AuthState {
    status: AuthStatus;
    authenticated: boolean;
    isUser: boolean;
    isAdmin: boolean;
}

export const AuthContext =
    createContext<AuthState | undefined>(undefined);
