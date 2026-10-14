import { type ReactNode, useCallback, useEffect, useState } from "react";
import { ToastContext } from "../utils/useToast.ts";

const TOAST_DURATION_MS = 1500;

type ToastProviderProps = {
    children: ReactNode;
};

type ShownToast = {
    id: number;
    message: string;
};

export function ToastProvider({ children }: Readonly<ToastProviderProps>) {
    const [shownToast, setShownToast] = useState<ShownToast | null>(null);

    const toast = useCallback((message: string) => {
        setShownToast((previous) => ({ id: (previous?.id ?? 0) + 1, message }));
    }, []);

    useEffect(() => {
        if (!shownToast) return;

        const timer = setTimeout(() => setShownToast(null), TOAST_DURATION_MS);
        return () => clearTimeout(timer);
    }, [shownToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {shownToast && (
                <div
                    key={shownToast.id}
                    className="toast"
                    role="status"
                    style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
                >
                    {shownToast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
}
