import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvalidIdError } from "../utils/useRequiredId.ts";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import React from "react";

function Throwing({ error }: Readonly<{ error: Error }>): never {
    throw error;
}

function renderInBoundary(child: React.ReactNode) {
    render(
        <MemoryRouter>
            <ErrorBoundary>{child}</ErrorBoundary>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ErrorBoundary", () => {
    it("renders its children when nothing fails", () => {
        renderInBoundary(<p>Page content</p>);

        expect(screen.getByText("Page content")).toBeInTheDocument();
    });

    it("shows a fallback with a reload button when a child fails to render", () => {
        renderInBoundary(<Throwing error={new Error("Unexpected")} />);

        expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Reload page" })).toBeInTheDocument();
    });

    it("shows the not-found page for an invalid id in the address", () => {
        renderInBoundary(<Throwing error={new InvalidIdError("abc")} />);

        expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    });
});
