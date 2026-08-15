import {useState} from "react";
import {keycloak} from "./keycloak.ts";
import {useAuth} from "./useAuth.ts";
import {ProfileDetails} from "../features/profile/components/ProfileDetails.tsx";
import {useProfile} from "../features/profile/queries/useProfile.ts";

export function AuthButton() {
    const {authenticated} = useAuth();
    const {data: profile} = useProfile();
    const [profileOpen, setProfileOpen] = useState(false);

    if (authenticated) {
        return (
            <>
                {profile ? (
                    <button
                        className="profile-name-button"
                        onClick={() => setProfileOpen(true)}
                        title="Profile details"
                    >
                        {profile.displayName}
                    </button>
                ) : (
                    <span>Profile details</span>
                )}
                <button
                    onClick={() => keycloak.logout({redirectUri: globalThis.location.origin})}
                    title="Logout"
                >
                    ⏻
                </button>
                {profileOpen && profile && (
                    <ProfileDetails
                        profile={profile}
                        onClose={() => setProfileOpen(false)}
                    />
                )}
            </>
        );
    }

    return (
        <button onClick={() => keycloak.login()} title="Login">
            ⏻
        </button>
    );
}
