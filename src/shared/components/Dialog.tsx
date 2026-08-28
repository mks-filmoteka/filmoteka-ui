import {type ReactNode, useEffect} from "react";
import "../styles/dialog.css";

type Props = {
    label: string;
    closeLabel?: string;
    className?: string;
    onClose: () => void;
    children: ReactNode;
};

export function Dialog(props: Readonly<Props>) {
    const {
        label,
        closeLabel = `Close ${label.toLowerCase()}`,
        className,
        onClose,
        children
    } = props;
    const panelClasses = ["dialog-panel", className].filter(Boolean).join(" ");

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="dialog-overlay">
            <button
                className="dialog-backdrop-button"
                aria-label={closeLabel}
                title="Close"
                onClick={onClose}
            />
            <div
                className={panelClasses}
                role="dialog"
                aria-label={label}
                aria-modal="true"
            >
                {children}
            </div>
        </div>
    );
}
