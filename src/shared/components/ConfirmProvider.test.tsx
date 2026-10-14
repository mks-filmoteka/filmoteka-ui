import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ConfirmProvider } from "./ConfirmProvider.tsx";
import { useConfirm } from "../utils/useConfirm.ts";

function ConfirmProbe() {
    const confirm = useConfirm();
    const [answer, setAnswer] = useState<string>();

    const ask = async () => {
        setAnswer(String(await confirm("Delete this film?")));
    };

    return (
        <>
            <button onClick={() => void ask()}>Ask</button>
            {answer && <p>Answer: {answer}</p>}
        </>
    );
}

function renderProbe() {
    render(
        <ConfirmProvider>
            <ConfirmProbe />
        </ConfirmProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ask" }));
}

describe("ConfirmProvider", () => {
    it("shows the question in a dialog", () => {
        renderProbe();

        expect(screen.getByRole("dialog", { name: "Confirm" })).toHaveTextContent("Delete this film?");
    });

    it("answers yes when confirmed", async () => {
        renderProbe();

        fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

        expect(await screen.findByText("Answer: true")).toBeInTheDocument();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("answers no when cancelled", async () => {
        renderProbe();

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(await screen.findByText("Answer: false")).toBeInTheDocument();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
