import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import ImageUpload from "./ImageUpload";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

let createObjectURL: Mock<(file: Blob | MediaSource) => string>;
let revokeObjectURL: Mock<(url: string) => void>;

beforeEach(() => {
    createObjectURL = vi.fn((file: Blob | MediaSource) => {
        if (file instanceof File) {
            return `blob:${file.name}`;
        }

        return "blob:media";
    });
    revokeObjectURL = vi.fn();

    Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        writable: true,
        value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        writable: true,
        value: revokeObjectURL,
    });
});

afterEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        writable: true,
        value: originalCreateObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        writable: true,
        value: originalRevokeObjectURL,
    });
});

describe("ImageUpload", () => {
    const getFileInput = (container: HTMLElement) => {
        const input = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (!input) {
            throw new Error("File input not found");
        }

        return input;
    };

    it("revokes preview URLs when the selected file changes and on unmount", async () => {
        const firstFile = new File(["first"], "first.jpg", { type: "image/jpeg" });
        const secondFile = new File(["second"], "second.png", { type: "image/png" });
        const onChange = vi.fn();
        const setFile = vi.fn();

        const { container, rerender, unmount } = render(
            <ImageUpload
                value={null}
                alt="Poster"
                onChange={onChange}
                file={null}
                setFile={setFile}
                removeLabel="Remove poster"
            />,
        );

        fireEvent.change(getFileInput(container), { target: { files: [firstFile] } });
        rerender(
            <ImageUpload
                value={null}
                alt="Poster"
                onChange={onChange}
                file={firstFile}
                setFile={setFile}
                removeLabel="Remove poster"
            />,
        );

        await waitFor(() => {
            expect(screen.getByAltText("Poster")).toHaveAttribute("src", "blob:first.jpg");
        });

        fireEvent.change(getFileInput(container), { target: { files: [secondFile] } });
        rerender(
            <ImageUpload
                value={null}
                alt="Poster"
                onChange={onChange}
                file={secondFile}
                setFile={setFile}
                removeLabel="Remove poster"
            />,
        );

        expect(setFile).toHaveBeenCalledWith(firstFile);
        expect(setFile).toHaveBeenCalledWith(secondFile);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:first.jpg");
        await waitFor(() => {
            expect(screen.getByAltText("Poster")).toHaveAttribute("src", "blob:second.png");
        });

        unmount();

        expect(createObjectURL).toHaveBeenCalledWith(firstFile);
        expect(createObjectURL).toHaveBeenCalledWith(secondFile);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:second.png");
    });

    it("returns to the saved image URL after clearing an unsaved file", async () => {
        const file = new File(["draft"], "draft.jpg", { type: "image/jpeg" });
        const onChange = vi.fn();
        const setFile = vi.fn();

        const { container, rerender } = render(
            <ImageUpload
                value="saved.jpg"
                alt="Poster"
                onChange={onChange}
                file={null}
                setFile={setFile}
                removeLabel="Remove poster"
            />,
        );

        fireEvent.change(getFileInput(container), { target: { files: [file] } });
        rerender(
            <ImageUpload
                value="saved.jpg"
                alt="Poster"
                onChange={onChange}
                file={file}
                setFile={setFile}
                removeLabel="Remove poster"
            />,
        );

        await waitFor(() => {
            expect(screen.getByAltText("Poster")).toHaveAttribute("src", "blob:draft.jpg");
        });

        fireEvent.click(screen.getByRole("button", { name: "Remove poster" }));
        rerender(
            <ImageUpload
                value="saved.jpg"
                alt="Poster"
                onChange={onChange}
                file={null}
                setFile={setFile}
                removeLabel="Remove poster"
            />,
        );

        expect(setFile).toHaveBeenCalledWith(null);
        expect(onChange).toHaveBeenCalledWith(null);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:draft.jpg");
        expect(screen.getByAltText("Poster")).toHaveAttribute(
            "src",
            "http://localhost:8081/api/v1/media/files/saved.jpg",
        );
    });
});
