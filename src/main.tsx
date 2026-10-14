import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./shared/styles/index.css";
import "./shared/styles/details.css";
import "./shared/styles/item.css";
import "./shared/styles/list.css";
import "./shared/styles/dialog.css";
import App from "./App.tsx";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { shouldRetryRequest } from "./shared/api/apiError.ts";
import { ConfirmProvider } from "./shared/components/ConfirmProvider.tsx";
import { ToastProvider } from "./shared/components/ToastProvider.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: shouldRetryRequest,
        },
    },
});
const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found");
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ConfirmProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </ConfirmProvider>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
);
