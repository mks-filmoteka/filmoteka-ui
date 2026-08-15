import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import type {UserProfile} from "../types/userProfile.ts";
import {ProfileDetails} from "./ProfileDetails.tsx";

type MutationOptions = {
    onSuccess?: (profile: UserProfile) => void;
    onError?: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
    isPending: false,
    updateProfileMutate: vi.fn()
}));

vi.mock("../queries/useUpdateProfile.ts", () => ({
    useUpdateProfile: () => ({
        isPending: mocks.isPending,
        mutate: mocks.updateProfileMutate
    })
}));

const profile: UserProfile = {
    email: "test@example.com",
    displayName: "Test User"
};

beforeEach(() => {
    vi.clearAllMocks();
    mocks.isPending = false;
    vi.stubGlobal("confirm", vi.fn(() => true));
});

describe("ProfileDetails", () => {
    it("renders profile details and closes from the overlay", () => {
        const onClose = vi.fn();
        const {container} = render(<ProfileDetails profile={profile} onClose={onClose}/>);

        expect(screen.getByText("Profile details")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getByText("Test User")).toBeInTheDocument();

        const overlay = container.querySelector<HTMLElement>(".filter-overlay");
        if (!overlay) {
            throw new Error("Expected profile overlay");
        }

        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("swaps display name controls while editing and cancels local changes", () => {
        render(<ProfileDetails profile={profile} onClose={vi.fn()}/>);

        fireEvent.click(screen.getByTitle("Edit display name"));
        fireEvent.change(screen.getByLabelText("edit display name"), {
            target: {value: "Changed User"}
        });

        expect(screen.getByLabelText("edit display name")).toHaveValue("Changed User");
        expect(screen.getByTitle("Save display name")).toBeInTheDocument();
        expect(screen.getByTitle("Cancel display name edit")).toBeInTheDocument();

        fireEvent.click(screen.getByTitle("Cancel display name edit"));

        expect(screen.queryByLabelText("edit display name")).not.toBeInTheDocument();
        expect(screen.getByText("Test User")).toBeInTheDocument();
        expect(mocks.updateProfileMutate).not.toHaveBeenCalled();
    });

    it("trims the edited display name before saving", () => {
        mocks.updateProfileMutate.mockImplementation(
            (_request: unknown, options?: MutationOptions) => {
                options?.onSuccess?.({
                    ...profile,
                    displayName: "Updated Test User"
                });
            }
        );
        render(<ProfileDetails profile={profile} onClose={vi.fn()}/>);

        fireEvent.click(screen.getByTitle("Edit display name"));
        fireEvent.change(screen.getByLabelText("edit display name"), {
            target: {value: "  Updated Test User  "}
        });
        fireEvent.click(screen.getByTitle("Save display name"));

        expect(globalThis.confirm).toHaveBeenCalledWith("Confirm changes?");
        expect(mocks.updateProfileMutate).toHaveBeenCalledWith(
            {displayName: "Updated Test User"},
            expect.any(Object)
        );
        expect(screen.queryByLabelText("edit display name")).not.toBeInTheDocument();
    });

    it("keeps edit mode open and shows the API error when update fails", async () => {
        const error = Object.assign(new Error("Update failed"), {
            response: {
                data: {
                    message: "Display name already exists",
                    errorDetails: [{field: "displayName", message: "Must be unique"}]
                }
            }
        });
        mocks.updateProfileMutate.mockImplementation(
            (_request: unknown, options?: MutationOptions) => {
                options?.onError?.(error);
            }
        );
        render(<ProfileDetails profile={profile} onClose={vi.fn()}/>);

        fireEvent.click(screen.getByTitle("Edit display name"));
        fireEvent.change(screen.getByLabelText("edit display name"), {
            target: {value: "Duplicate User"}
        });
        fireEvent.click(screen.getByTitle("Save display name"));

        await waitFor(() => {
            expect(screen.getByText("Display name already exists")).toBeInTheDocument();
        });
        expect(screen.getByText("displayName: Must be unique")).toBeInTheDocument();
        expect(screen.getByLabelText("edit display name")).toBeInTheDocument();
    });
});
