import { type ReactNode, useEffect, useRef } from "react";
import "../styles/dialog.css";

type Props = {
    label: string;
    closeLabel?: string;
    className?: string;
    onClose: () => void;
    children: ReactNode;
};

const openDialogs: symbol[] = [];

export function Dialog(props: Readonly<Props>) {
    const { label, closeLabel = `Close ${label.toLowerCase()}`, className, onClose, children } = props;
    const panelClasses = ["dialog-panel", className].filter(Boolean).join(" ");

    const dialogId = useRef(Symbol(label));

    useEffect(() => {
        const id = dialogId.current;
        openDialogs.push(id);
        return () => {
            openDialogs.splice(openDialogs.indexOf(id), 1);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && openDialogs.at(-1) === dialogId.current) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="dialog-overlay">
            <button className="dialog-backdrop-button" aria-label={closeLabel} title="Close" onClick={onClose} />
            <div className={panelClasses} role="dialog" aria-label={label} aria-modal="true">
                {children}
            </div>
        </div>
    );
}
