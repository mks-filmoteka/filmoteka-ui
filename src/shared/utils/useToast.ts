import { createContext, useContext } from "react";

export type Toast = (message: string) => void;

export const ToastContext = createContext<Toast | undefined>(undefined);

export function useToast(): Toast {
    const toast = useContext(ToastContext);

    if (!toast) {
        throw new Error("useToast must be used inside ToastProvider");
    }

    return toast;
}
