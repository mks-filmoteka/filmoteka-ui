import {act, render, screen, waitFor} from "@testing-library/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {AuthProvider} from "./AuthProvider.tsx";
import {useAuth} from "./useAuth.ts";

const keycloakMock = vi.hoisted(() => ({
    authenticated: false,
    roles: new Set<string>(),
    hasRealmRole: vi.fn(),
    clearToken: vi.fn(),
    onAuthSuccess: undefined as (() => void) | undefined,
    onAuthRefreshSuccess: undefined as (() => void) | undefined,
    onAuthLogout: undefined as (() => void) | undefined,
    onAuthRefreshError: undefined as (() => void) | undefined
}));
const initializeKeycloakMock = vi.hoisted(() => vi.fn());

vi.mock("./keycloak.ts", () => ({
    keycloak: keycloakMock,
    initializeKeycloak: initializeKeycloakMock
}));

function AuthStateProbe() {
    const auth = useAuth();

    return (
        <>
            <span data-testid="authenticated">{String(auth.authenticated)}</span>
            <span data-testid="status">{auth.status}</span>
            <span data-testid="is-user">{String(auth.isUser)}</span>
            <span data-testid="is-admin">{String(auth.isAdmin)}</span>
        </>
    );
}

function renderAuthProvider() {
    const queryClient = new QueryClient();
    const result = render(
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AuthStateProbe/>
            </AuthProvider>
        </QueryClientProvider>
    );

    return {
        ...result,
        queryClient
    };
}

beforeEach(() => {
    keycloakMock.authenticated = false;
    keycloakMock.roles.clear();
    keycloakMock.hasRealmRole.mockReset();
    keycloakMock.hasRealmRole.mockImplementation((role: string) => keycloakMock.roles.has(role));
    keycloakMock.clearToken.mockReset();
    keycloakMock.clearToken.mockImplementation(() => {
        keycloakMock.authenticated = false;
        keycloakMock.roles.clear();
    });
    keycloakMock.onAuthSuccess = undefined;
    keycloakMock.onAuthRefreshSuccess = undefined;
    keycloakMock.onAuthLogout = undefined;
    keycloakMock.onAuthRefreshError = undefined;
    initializeKeycloakMock.mockReset();
    initializeKeycloakMock.mockResolvedValue(false);
});

describe("AuthProvider", () => {
    it("provides an unauthenticated state when keycloak has not authenticated", async () => {
        renderAuthProvider();

        await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("guest"));
        expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
        expect(screen.getByTestId("is-user")).toHaveTextContent("false");
        expect(screen.getByTestId("is-admin")).toHaveTextContent("false");
        expect(initializeKeycloakMock).toHaveBeenCalledOnce();
        expect(keycloakMock.hasRealmRole).not.toHaveBeenCalled();
    });

    it("synchronizes auth state when keycloak reports auth success", async () => {
        renderAuthProvider();

        await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("guest"));
        keycloakMock.authenticated = true;
        keycloakMock.roles.add("USER");
        keycloakMock.roles.add("ADMIN");
        act(() => keycloakMock.onAuthSuccess?.());

        expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
        expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
        expect(screen.getByTestId("is-user")).toHaveTextContent("true");
        expect(screen.getByTestId("is-admin")).toHaveTextContent("true");
    });

    it("clears the token and synchronizes auth state when token refresh fails", async () => {
        keycloakMock.authenticated = true;
        keycloakMock.roles.add("USER");
        const {queryClient, unmount} = renderAuthProvider();
        await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
        queryClient.setQueryData(["profile"], {displayName: "Test User"});
        queryClient.setQueryData(["collections"], [{id: 1}]);
        queryClient.setQueryData(["collection", 1], {id: 1});
        queryClient.setQueryData(["films", "collection", 1], []);

        act(() => keycloakMock.onAuthRefreshError?.());

        expect(keycloakMock.clearToken).toHaveBeenCalledOnce();
        expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
        expect(screen.getByTestId("status")).toHaveTextContent("guest");
        expect(screen.getByTestId("is-user")).toHaveTextContent("false");
        expect(screen.getByTestId("is-admin")).toHaveTextContent("false");
        expect(queryClient.getQueryData(["profile"])).toBeUndefined();
        expect(queryClient.getQueryData(["collections"])).toBeUndefined();
        expect(queryClient.getQueryData(["collection", 1])).toBeUndefined();
        expect(queryClient.getQueryData(["films", "collection", 1])).toBeUndefined();

        unmount();
        expect(keycloakMock.onAuthSuccess).toBeUndefined();
        expect(keycloakMock.onAuthRefreshSuccess).toBeUndefined();
        expect(keycloakMock.onAuthLogout).toBeUndefined();
        expect(keycloakMock.onAuthRefreshError).toBeUndefined();
    });
});
