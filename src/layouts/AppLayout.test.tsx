import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {AppLayout} from "./AppLayout.tsx";

const mocks = vi.hoisted(() => ({
    authenticated: true,
    navigate: vi.fn(),
    useNavigate: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    useProfile: vi.fn(),
    profile: {
        email: "test@example.com",
        displayName: "Test User"
    } as {email: string; displayName: string} | undefined
}));

vi.mock("react-router", async () => {
    const actual = await vi.importActual<typeof import("react-router")>("react-router");
    return {
        ...actual,
        useNavigate: mocks.useNavigate
    };
});

vi.mock("../auth/keycloak.ts", () => ({
    keycloak: {
        login: mocks.login,
        logout: mocks.logout
    }
}));

vi.mock("../auth/useAuth.ts", () => ({
    useAuth: () => ({
        authenticated: mocks.authenticated
    })
}));

vi.mock("../features/profile/queries/useProfile.ts", () => ({
    useProfile: mocks.useProfile
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
    mocks.useNavigate.mockReturnValue(mocks.navigate);
    mocks.useProfile.mockReturnValue({
        data: mocks.profile
    });
});

describe("AppLayout", () => {
    it("renders profile details from the layout", () => {
        render(<AppLayout/>);

        expect(screen.queryByRole("dialog", {name: "Profile details"})).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", {name: "Test User"}));
        expect(screen.getByRole("dialog", {name: "Profile details"})).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        fireEvent.click(screen.getByText("close profile"));
        expect(screen.queryByRole("dialog", {name: "Profile details"})).not.toBeInTheDocument();
    });

    it("does not render a profile details placeholder without profile data", () => {
        mocks.useProfile.mockReturnValue({
            data: undefined
        });

        render(<AppLayout/>);

        expect(screen.queryByText("Profile details")).not.toBeInTheDocument();
        expect(screen.queryByTitle("Profile details")).not.toBeInTheDocument();
    });

    it("logs out authenticated users from the layout", () => {
        render(<AppLayout/>);

        fireEvent.click(screen.getByTitle("Logout"));

        expect(mocks.logout).toHaveBeenCalledWith({redirectUri: globalThis.location.origin});
    });

    it("logs in unauthenticated users from the layout", () => {
        mocks.authenticated = false;

        render(<AppLayout/>);

        fireEvent.click(screen.getByTitle("Login"));

        expect(mocks.login).toHaveBeenCalledTimes(1);
    });
});
