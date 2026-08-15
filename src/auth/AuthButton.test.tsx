import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {AuthButton} from "./AuthButton.tsx";

const mocks = vi.hoisted(() => ({
    authenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    profile: {
        email: "test@example.com",
        displayName: "Test User"
    } as {email: string; displayName: string} | undefined
}));

vi.mock("./keycloak.ts", () => ({
    keycloak: {
        login: mocks.login,
        logout: mocks.logout
    }
}));

vi.mock("./useAuth.ts", () => ({
    useAuth: () => ({
        authenticated: mocks.authenticated
    })
}));

vi.mock("../features/profile/queries/useProfile.ts", () => ({
    useProfile: () => ({
        data: mocks.profile
    })
}));

vi.mock("../features/profile/components/ProfileDetails.tsx", () => ({
    ProfileDetails: ({
        profile,
        onClose
    }: {
        profile: {email: string};
        onClose: () => void;
    }) => (
        <div role="dialog" aria-label="Profile details">
            <span>{profile.email}</span>
            <button onClick={onClose}>close profile</button>
        </div>
    )
}));

beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticated = true;
    mocks.profile = {
        email: "test@example.com",
        displayName: "Test User"
    };
});

describe("AuthButton", () => {
    it("opens profile details", () => {
        render(<AuthButton/>);

        expect(screen.queryByRole("dialog", {name: "Profile details"})).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", {name: "Test User"}));
        expect(screen.getByRole("dialog", {name: "Profile details"})).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        fireEvent.click(screen.getByText("close profile"));
        expect(screen.queryByRole("dialog", {name: "Profile details"})).not.toBeInTheDocument();
    });

    it("keeps login behavior for unauthenticated users", () => {
        mocks.authenticated = false;
        render(<AuthButton/>);
        fireEvent.click(screen.getByTitle("Login"));
        expect(mocks.login).toHaveBeenCalledTimes(1);
    });
});
