import {createContext} from "react";

export interface AuthState {
    authenticated: boolean;
    isUser: boolean;
    isAdmin: boolean;
}

export const AuthContext =
    createContext<AuthState | undefined>(undefined);
