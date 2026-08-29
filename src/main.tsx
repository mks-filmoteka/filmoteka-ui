import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import './shared/styles/index.css'
import './shared/styles/details.css'
import './shared/styles/item.css'
import './shared/styles/list.css'
import './shared/styles/dialog.css'
import App from './App.tsx'
import {keycloak} from "./auth/keycloak.ts";
import {AuthProvider} from "./auth/AuthProvider.tsx";

const queryClient = new QueryClient();
const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Root element not found");
}

try {
    await keycloak.init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        silentCheckSsoRedirectUri: `${globalThis.location.origin}/silent-check-sso.html`,
        silentCheckSsoFallback: false,
    });
} catch (error) {
    console.error("Keycloak initialization failed. Continuing as guest.", error);
    keycloak.clearToken();
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
)
