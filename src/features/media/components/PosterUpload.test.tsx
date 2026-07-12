import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi, type Mock} from "vitest";
import PosterUpload from "./PosterUpload";

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

describe("PosterUpload", () => {
    const getFileInput = (container: HTMLElement) => {
        const input = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (!input) {
            throw new Error("File input not found");
        }

        return input;
    };

    it("revokes preview URLs when the selected poster file changes and on unmount", async () => {
        const firstFile = new File(["first"], "first.jpg", {type: "image/jpeg"});
        const secondFile = new File(["second"], "second.png", {type: "image/png"});
        const onChange = vi.fn();
        const setPosterFile = vi.fn();

        const {container, rerender, unmount} = render(
            <PosterUpload
                value={null}
                alt="Poster"
                onChange={onChange}
                posterFile={null}
                setPosterFile={setPosterFile}
            />
        );

        fireEvent.change(getFileInput(container), {target: {files: [firstFile]}});
        rerender(
            <PosterUpload
                value={null}
                alt="Poster"
                onChange={onChange}
                posterFile={firstFile}
                setPosterFile={setPosterFile}
            />
        );

        await waitFor(() => {
            expect(screen.getByAltText("Poster")).toHaveAttribute("src", "blob:first.jpg");
        });

        fireEvent.change(getFileInput(container), {target: {files: [secondFile]}});
        rerender(
            <PosterUpload
                value={null}
                alt="Poster"
                onChange={onChange}
                posterFile={secondFile}
                setPosterFile={setPosterFile}
            />
        );

        expect(setPosterFile).toHaveBeenCalledWith(firstFile);
        expect(setPosterFile).toHaveBeenCalledWith(secondFile);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:first.jpg");
        await waitFor(() => {
            expect(screen.getByAltText("Poster")).toHaveAttribute("src", "blob:second.png");
        });

        unmount();

        expect(createObjectURL).toHaveBeenCalledWith(firstFile);
        expect(createObjectURL).toHaveBeenCalledWith(secondFile);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:second.png");
    });

    it("returns to the saved poster URL after clearing an unsaved poster file", async () => {
        const file = new File(["draft"], "draft.jpg", {type: "image/jpeg"});
        const onChange = vi.fn();
        const setPosterFile = vi.fn();

        const {container, rerender} = render(
            <PosterUpload
                value="saved.jpg"
                alt="Poster"
                onChange={onChange}
                posterFile={null}
                setPosterFile={setPosterFile}
            />
        );

        fireEvent.change(getFileInput(container), {target: {files: [file]}});
        rerender(
            <PosterUpload
                value="saved.jpg"
                alt="Poster"
                onChange={onChange}
                posterFile={file}
                setPosterFile={setPosterFile}
            />
        );

        await waitFor(() => {
            expect(screen.getByAltText("Poster")).toHaveAttribute("src", "blob:draft.jpg");
        });

        const removeButton = container.querySelector<HTMLButtonElement>(".poster-remove-button");
        if (!removeButton) {
            throw new Error("Remove button not found");
        }

        fireEvent.click(removeButton);
        rerender(
            <PosterUpload
                value="saved.jpg"
                alt="Poster"
                onChange={onChange}
                posterFile={null}
                setPosterFile={setPosterFile}
            />
        );

        expect(setPosterFile).toHaveBeenCalledWith(null);
        expect(onChange).toHaveBeenCalledWith(null);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:draft.jpg");
        expect(screen.getByAltText("Poster")).toHaveAttribute(
            "src",
            "http://localhost:8081/api/v1/media/files/saved.jpg"
        );
    });
});
