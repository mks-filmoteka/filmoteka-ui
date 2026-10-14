import { createContext, useContext } from "react";

export type Confirm = (message: string) => Promise<boolean>;

export const ConfirmContext = createContext<Confirm | undefined>(undefined);

export function useConfirm(): Confirm {
    const confirm = useContext(ConfirmContext);

    if (!confirm) {
        throw new Error("useConfirm must be used inside ConfirmProvider");
    }

    return confirm;
}
