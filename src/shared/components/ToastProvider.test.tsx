import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "../utils/useToast.ts";
import { ToastProvider } from "./ToastProvider.tsx";

function ToastProbe() {
    const toast = useToast();

    return (
        <>
            <button onClick={() => toast("Added to Favourites")}>First</button>
            <button onClick={() => toast("Removed from Favourites")}>Second</button>
        </>
    );
}

beforeEach(() => {
    vi.useFakeTimers();
    render(
        <ToastProvider>
            <ToastProbe />
        </ToastProvider>,
    );
});

afterEach(() => {
    vi.useRealTimers();
});

describe("ToastProvider", () => {
    it("shows a message and hides it after a moment", () => {
        fireEvent.click(screen.getByRole("button", { name: "First" }));

        expect(screen.getByRole("status")).toHaveTextContent("Added to Favourites");

        act(() => vi.advanceTimersByTime(1500));

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("replaces the current message with a new one", () => {
        fireEvent.click(screen.getByRole("button", { name: "First" }));
        act(() => vi.advanceTimersByTime(1000));
        fireEvent.click(screen.getByRole("button", { name: "Second" }));

        expect(screen.getByRole("status")).toHaveTextContent("Removed from Favourites");

        act(() => vi.advanceTimersByTime(1000));

        expect(screen.getByRole("status")).toHaveTextContent("Removed from Favourites");
    });
});
