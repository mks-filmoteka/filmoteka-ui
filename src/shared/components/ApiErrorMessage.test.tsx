import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiErrorMessage } from "./ApiErrorMessage.tsx";

describe("ApiErrorMessage", () => {
    it("shows the server message and details for a failed request", () => {
        const error = Object.assign(new Error("Request failed with status code 400"), {
            response: {
                status: 400,
                data: {
                    status: 400,
                    message: "Validation failed",
                    errorDetails: [{ field: "title", message: "must not be blank" }],
                },
            },
        });

        render(<ApiErrorMessage error={error} message="Error loading film" />);

        expect(screen.getByRole("alert")).toHaveTextContent("Error loading film: Validation failed");
        expect(screen.getByText("title: must not be blank")).toBeInTheDocument();
    });

    it("shows a readable message when the server can't be reached", () => {
        const error = Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" });

        render(<ApiErrorMessage error={error} />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Can't reach the server. Check your connection and try again.",
        );
    });
});
