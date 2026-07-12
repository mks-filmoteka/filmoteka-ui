import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {TextInput} from "./TextInput";

describe("TextInput", () => {
    it("sanitizes changed values before notifying the caller", () => {
        const onChange = vi.fn();

        render(
            <TextInput
                ariaLabel="name"
                value=""
                onChange={onChange}
                regex={/[^a-z\s]/g}
            />
        );

        fireEvent.change(screen.getByLabelText("name"), {
            target: {value: "test 123!"},
        });

        expect(onChange).toHaveBeenCalledWith("test ");
    });

    it("calls onEnter only when Enter is pressed", () => {
        const onEnter = vi.fn();

        render(
            <TextInput
                ariaLabel="search"
                value=""
                onChange={vi.fn()}
                onEnter={onEnter}
            />
        );

        const input = screen.getByLabelText("search");
        fireEvent.keyDown(input, {key: "Escape"});
        fireEvent.keyDown(input, {key: "Enter"});

        expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("forwards native input attributes", () => {
        render(
            <TextInput
                ariaLabel="title"
                value="Test Title"
                onChange={vi.fn()}
                maxLength={10}
                placeholder="Title"
                disabled
                required
            />
        );

        const input = screen.getByLabelText("title");

        expect(input).toHaveAttribute("maxlength", "10");
        expect(input).toHaveAttribute("placeholder", "Title");
        expect(input).toBeDisabled();
        expect(input).toBeRequired();
    });
});
