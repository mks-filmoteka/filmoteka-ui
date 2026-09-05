import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
    it("renders an accessible dialog", () => {
        render(
            <Dialog label="Details" onClose={vi.fn()}>
                Dialog content
            </Dialog>,
        );

        const dialog = screen.getByRole("dialog", { name: "Details" });

        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveTextContent("Dialog content");
    });

    it("closes from the backdrop button", () => {
        const onClose = vi.fn();

        render(
            <Dialog label="Details" onClose={onClose}>
                Dialog content
            </Dialog>,
        );

        fireEvent.click(screen.getByLabelText("Close details"));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not close when the dialog panel is clicked", () => {
        const onClose = vi.fn();
        render(
            <Dialog label="Details" onClose={onClose}>
                Dialog content
            </Dialog>,
        );

        fireEvent.click(screen.getByRole("dialog", { name: "Details" }));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("closes when Escape is pressed", () => {
        const onClose = vi.fn();

        render(
            <Dialog label="Details" onClose={onClose}>
                Dialog content
            </Dialog>,
        );

        fireEvent.keyDown(document, { key: "Escape" });

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
