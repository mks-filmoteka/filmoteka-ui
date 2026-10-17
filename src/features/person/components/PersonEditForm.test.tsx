import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PersonEditForm } from "./PersonEditForm";
import type { MutationOptions } from "../../../test/mutationOptions";
import { testPerson } from "../../../test/testData";

const mocks = vi.hoisted(() => ({
    confirm: vi.fn(),
    useUpdatePerson: vi.fn(),
    updatePersonMutate: vi.fn(),
    useUploadFile: vi.fn(),
    uploadFileMutate: vi.fn(),
    deleteFile: vi.fn(),
}));

vi.mock("../../../shared/utils/useConfirm.ts", () => ({
    useConfirm: () => mocks.confirm,
}));

vi.mock("../queries/useUpdatePerson.ts", () => ({
    useUpdatePerson: mocks.useUpdatePerson,
}));

vi.mock("../../media/queries/useUploadFile.ts", () => ({
    useUploadFile: mocks.useUploadFile,
}));

vi.mock("../../media/api/mediaApi.ts", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../media/api/mediaApi.ts")>()),
    deleteFile: mocks.deleteFile,
}));

const person = testPerson({
    id: 7,
    birthDate: "1930-05-31",
    placeOfBirth: "San Francisco, USA",
    photoName: "old.jpg",
});

const saveError = Object.assign(new Error("Save failed"), {
    response: { data: { message: "Name already exists" } },
});

function renderForm(onDone = vi.fn()) {
    const view = render(<PersonEditForm person={person} roles="Actor" onDone={onDone} />);
    return { ...view, onDone };
}

function selectPhoto(container: HTMLElement) {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
        throw new Error("Photo input not found");
    }
    fireEvent.change(input, { target: { files: [new File(["photo"], "new.jpg", { type: "image/jpeg" })] } });
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 17));
    mocks.confirm.mockResolvedValue(true);
    mocks.deleteFile.mockResolvedValue(undefined);
    mocks.useUpdatePerson.mockReturnValue({ mutate: mocks.updatePersonMutate, isPending: false });
    mocks.useUploadFile.mockReturnValue({ mutate: mocks.uploadFileMutate, isPending: false });
    mocks.updatePersonMutate.mockImplementation((_variables: unknown, options?: MutationOptions) => {
        options?.onSuccess?.();
    });
    mocks.uploadFileMutate.mockImplementation((_file: File, options?: MutationOptions<{ fileName: string }>) => {
        options?.onSuccess?.({ fileName: "new.jpg" });
    });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:photo") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
});

describe("PersonEditForm", () => {
    it("starts with the person's current details", () => {
        renderForm();

        expect(screen.getByLabelText("edit name")).toHaveValue("Test Person");
        expect(screen.getByLabelText("birth date")).toHaveValue("1930-05-31");
        expect(screen.getByLabelText("death date")).toHaveValue("");
        expect(screen.getByLabelText("birthplace")).toHaveValue("San Francisco, USA");
        expect(screen.getByTitle("Save")).toBeDisabled();
    });

    it("saves all details after confirmation", async () => {
        const { onDone } = renderForm();

        fireEvent.change(screen.getByLabelText("edit name"), { target: { value: "  New Name  " } });
        fireEvent.change(screen.getByLabelText("death date"), { target: { value: "2020-01-01" } });
        fireEvent.change(screen.getByLabelText("birthplace"), { target: { value: "  Rome, Italy  " } });
        fireEvent.click(screen.getByTitle("Save"));

        await waitFor(() => expect(onDone).toHaveBeenCalled());
        expect(mocks.confirm).toHaveBeenCalledWith("Confirm person update?");
        expect(mocks.updatePersonMutate).toHaveBeenCalledWith(
            {
                id: 7,
                request: {
                    name: "New Name",
                    birthDate: "1930-05-31",
                    deathDate: "2020-01-01",
                    placeOfBirth: "Rome, Italy",
                    photoName: "old.jpg",
                },
            },
            expect.any(Object),
        );
    });

    it("sends cleared details as empty", async () => {
        renderForm();

        fireEvent.change(screen.getByLabelText("birth date"), { target: { value: "" } });
        fireEvent.change(screen.getByLabelText("birthplace"), { target: { value: "" } });
        fireEvent.click(screen.getByRole("button", { name: "Remove photo" }));
        fireEvent.click(screen.getByTitle("Save"));

        await waitFor(() => expect(mocks.updatePersonMutate).toHaveBeenCalled());
        expect(mocks.updatePersonMutate.mock.calls[0][0].request).toEqual({
            name: "Test Person",
            birthDate: null,
            deathDate: null,
            placeOfBirth: null,
            photoName: null,
        });
    });

    it("uploads a new photo before saving", async () => {
        const { container } = renderForm();

        selectPhoto(container);
        fireEvent.click(screen.getByTitle("Save"));

        await waitFor(() => expect(mocks.updatePersonMutate).toHaveBeenCalled());
        expect(mocks.uploadFileMutate).toHaveBeenCalled();
        expect(mocks.updatePersonMutate.mock.calls[0][0].request.photoName).toBe("new.jpg");
        expect(mocks.deleteFile).not.toHaveBeenCalled();
    });

    it("deletes the uploaded photo and shows the error when saving fails", async () => {
        mocks.updatePersonMutate.mockImplementation((_variables: unknown, options?: MutationOptions) => {
            options?.onError?.(saveError);
        });
        const { container, onDone } = renderForm();

        selectPhoto(container);
        fireEvent.click(screen.getByTitle("Save"));

        await waitFor(() => expect(screen.getByText("Name already exists")).toBeInTheDocument());
        expect(mocks.deleteFile).toHaveBeenCalledWith("new.jpg");
        expect(onDone).not.toHaveBeenCalled();
    });

    it("blocks saving and explains when the dates are invalid", () => {
        renderForm();

        fireEvent.change(screen.getByLabelText("death date"), { target: { value: "1920-01-01" } });

        expect(screen.getByText("Death date must not be before birth date")).toBeInTheDocument();
        expect(screen.getByTitle("Save")).toBeDisabled();
    });

    it("leaves without saving on cancel", () => {
        const { onDone } = renderForm();

        fireEvent.change(screen.getByLabelText("edit name"), { target: { value: "New Name" } });
        fireEvent.click(screen.getByTitle("Cancel"));

        expect(onDone).toHaveBeenCalled();
        expect(mocks.updatePersonMutate).not.toHaveBeenCalled();
    });
});
