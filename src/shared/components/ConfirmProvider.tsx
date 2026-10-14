import { type ReactNode, useCallback, useState } from "react";
import { Dialog } from "./Dialog.tsx";
import { ConfirmContext } from "../utils/useConfirm.ts";

type ConfirmProviderProps = {
    children: ReactNode;
};

type PendingConfirmation = {
    message: string;
    resolve: (confirmed: boolean) => void;
};

export function ConfirmProvider({ children }: Readonly<ConfirmProviderProps>) {
    const [pending, setPending] = useState<PendingConfirmation | null>(null);

    const confirm = useCallback(
        (message: string) => new Promise<boolean>((resolve) => setPending({ message, resolve })),
        [],
    );

    const answer = (confirmed: boolean) => {
        pending?.resolve(confirmed);
        setPending(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {pending && (
                <Dialog
                    label="Confirm"
                    closeLabel="Cancel confirmation"
                    className="confirm-dialog"
                    onClose={() => answer(false)}
                >
                    <p>{pending.message}</p>
                    <div className="dialog-actions">
                        <button type="button" onClick={() => answer(true)}>
                            Confirm
                        </button>
                        <button type="button" onClick={() => answer(false)}>
                            Cancel
                        </button>
                    </div>
                </Dialog>
            )}
        </ConfirmContext.Provider>
    );
}
