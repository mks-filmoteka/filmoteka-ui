import {keycloak} from "./keycloak.ts";
import {useAuth} from "./useAuth.ts";
import {useProfile} from "../features/profile/queries/useProfile.ts";

export function AuthButton() {
    const {authenticated} = useAuth();
    const {data: profile} = useProfile();

    if (authenticated) {
        return (
            <>
                <span>{profile?.displayName}</span>
                <button
                    onClick={() => keycloak.logout({redirectUri: globalThis.location.origin})}
                    title="Logout"
                >
                    ⏻
                </button>
            </>
        );
    }

    return (
        <button onClick={() => keycloak.login()} title="Login">
            ⏻
        </button>
    );
}