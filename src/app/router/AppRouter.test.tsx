import { render, screen } from "@testing-library/react";
import { Outlet } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppRouter from "./AppRouter.tsx";

vi.mock("../../layouts/AppLayout.tsx", () => ({
    AppLayout: () => <Outlet />,
}));

vi.mock("../../features/film/pages/AllFilmsPage.tsx", () => ({
    default: () => <h1>All films page</h1>,
}));

function renderAt(path: string) {
    window.history.pushState({}, "", path);
    render(<AppRouter />);
}

afterEach(() => {
    window.history.pushState({}, "", "/");
});

describe("AppRouter", () => {
    it("shows the not-found page for an unknown address", () => {
        renderAt("/no/such/page");

        expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Back to films" })).toHaveAttribute("href", "/films");
    });

    it("still routes known addresses", () => {
        renderAt("/films");

        expect(screen.getByRole("heading", { name: "All films page" })).toBeInTheDocument();
    });
});
