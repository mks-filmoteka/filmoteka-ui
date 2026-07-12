import {fireEvent, render, screen} from "@testing-library/react";
import {type Dispatch, type SetStateAction, useState} from "react";
import {describe, expect, it, vi} from "vitest";
import type {FilmRequest} from "../types/filmRequest";
import {FilmForm} from "./FilmForm";

const validForm: FilmRequest = {
    title: "Test Title",
    releaseYear: 2000,
    countries: ["United States"],
    description: "Test description.",
    posterName: null,
    genres: ["Action"],
    actors: [{name: "Test Actor"}],
    directors: [{name: "Test Director"}],
};

function getTitleControlButton(container: HTMLElement, index: number) {
    const buttons = container.querySelectorAll<HTMLButtonElement>(".page-title-controls button");
    const button = buttons[index];
    if (!button) {
        throw new Error(`Title control button ${index} not found`);
    }

    return button;
}

function FilmFormHarness({
    initialForm = validForm,
    onSave = vi.fn(),
    onCancel = vi.fn(),
    isChanged,
    isPending,
}: {
    initialForm?: FilmRequest;
    onSave?: () => void;
    onCancel?: () => void;
    isChanged?: boolean;
    isPending?: boolean;
}) {
    const [form, setForm] = useState<FilmRequest>(initialForm);
    const [posterFile, setPosterFile] = useState<File | null>(null);

    return (
        <FilmForm
            form={form}
            setForm={setForm as Dispatch<SetStateAction<FilmRequest>>}
            onSave={onSave}
            onCancel={onCancel}
            posterFile={posterFile}
            setPosterFile={setPosterFile}
            isChanged={isChanged}
            isPending={isPending}
        />
    );
}

describe("FilmForm", () => {
    it("disables save when required fields are invalid", () => {
        const invalidForm = {
            ...validForm,
            title: " ",
        };

        const {container} = render(<FilmFormHarness initialForm={invalidForm} />);

        expect(getTitleControlButton(container, 0)).toBeDisabled();
    });

    it("disables save when nothing changed or a save is pending", () => {
        const {container, rerender} = render(<FilmFormHarness isChanged={false} />);

        expect(getTitleControlButton(container, 0)).toBeDisabled();

        rerender(<FilmFormHarness isChanged isPending />);

        expect(getTitleControlButton(container, 0)).toBeDisabled();
    });

    it("calls save and cancel handlers from title controls", () => {
        const onSave = vi.fn();
        const onCancel = vi.fn();

        const {container} = render(
            <FilmFormHarness onSave={onSave} onCancel={onCancel} isChanged />
        );

        fireEvent.click(getTitleControlButton(container, 0));
        fireEvent.click(getTitleControlButton(container, 1));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("updates text fields and dynamic person rows", () => {
        render(<FilmFormHarness />);

        fireEvent.change(screen.getByLabelText("actor 0"), {
            target: {value: "Updated Test Actor"},
        });
        fireEvent.click(screen.getByText("+ Add actor"));
        fireEvent.click(screen.getByText("+ Add director"));

        expect(screen.getByLabelText("actor 0")).toHaveValue("Updated Test Actor");
        expect(screen.getByLabelText("actor 1")).toHaveValue("");
        expect(screen.getByLabelText("director 1")).toHaveValue("");
    });

    it("adds and removes genre and country rows", () => {
        const {container} = render(<FilmFormHarness />);

        fireEvent.click(screen.getByText("+ Add country"));
        fireEvent.click(screen.getByText("+ Add genre"));

        expect(container.querySelectorAll("select")).toHaveLength(5);

        const detailSections = container.querySelectorAll<HTMLElement>(".details-column > div");
        const countrySection = detailSections[1];
        const genreSection = detailSections[2];
        const countryRemove = countrySection.querySelector<HTMLButtonElement>(".array-editor-row button");
        const genreRemove = genreSection.querySelector<HTMLButtonElement>(".array-editor-row button");

        if (!countryRemove || !genreRemove) {
            throw new Error("Expected country and genre remove buttons");
        }

        fireEvent.click(countryRemove);
        fireEvent.click(genreRemove);

        expect(container.querySelectorAll("select")).toHaveLength(3);
    });
});
