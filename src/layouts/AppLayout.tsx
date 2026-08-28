import {Outlet, useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {INPUT_RULES} from "../shared/utils/inputValidation.ts";
import {TextInput} from "../shared/components/TextInput.tsx";
import {useAuth} from "../auth/useAuth.ts";
import {keycloak} from "../auth/keycloak.ts";
import {CollectionsPopup} from "../features/collection/components/CollectionsPopup.tsx";
import {useProfile} from "../features/profile/queries/useProfile.ts";
import {ProfileDetails} from "../features/profile/components/ProfileDetails.tsx";
import {IconButton} from "../shared/components/IconButton.tsx";

type ActivePopup = "collections" | "profile";

export function AppLayout() {
    const navigate = useNavigate();
    const {authenticated} = useAuth();
    const {data: profile} = useProfile();
    const [search, setSearch] = useState("");
    const [activePopup, setActivePopup] = useState<ActivePopup>();
    const [showHeader, setShowHeader] = useState(true);
    const previousScrollY = useRef(0);
    const toggleCollections = () => {
        setActivePopup(current => current === "collections" ? undefined : "collections");
    };
    const openProfileDetails = () => setActivePopup("profile");
    const closePopup = () => setActivePopup(undefined);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 20) {
                setShowHeader(true);
                previousScrollY.current = currentScrollY;
                return;
            }
            setShowHeader(currentScrollY < previousScrollY.current);
            previousScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={showHeader ? "layout-header" : "layout-header layout-header-hidden"}>
            <header className={showHeader ? "" : "header-hidden"}>
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={() => navigate("/films")} title="Home">
                            <img src="/favicon.svg" alt="Home" className="home-button-img"/>
                        </button>
                        {authenticated && (
                            <IconButton
                                icon="collection"
                                label="Collections"
                                onClick={toggleCollections}
                            />
                        )}
                    </div>

                    <div className="header-center">
                        <TextInput
                            id="title-search"
                            ariaLabel="Search films"
                            className="search-input"
                            value={search}
                            maxLength={255}
                            onChange={setSearch}
                            placeholder="Search films..."
                            regex={INPUT_RULES.title}
                            onEnter={() => {
                                const params = new URLSearchParams();
                                if (search.trim()) {
                                    params.set("page", "1");
                                    params.set("title", search.trim());
                                }
                                navigate(`/films?${params}`);
                                setSearch("");
                            }}
                        />
                        {search !== "" && (
                            <IconButton
                                icon="clear"
                                label="Clear search"
                                className="input-clear"
                                onClick={() => setSearch("")}
                            />
                        )}
                    </div>
                    <div className="header-right">
                        {authenticated && profile && (
                            <button
                                className="profile-name-button"
                                onClick={openProfileDetails}
                                title="Profile details"
                            >
                                {profile.displayName}
                            </button>
                        )}
                        {authenticated ? (
                            <IconButton
                                icon="power"
                                label="Logout"
                                onClick={() => keycloak.logout({redirectUri: globalThis.location.origin})}
                            />
                        ) : (
                            <IconButton
                                icon="power"
                                label="Login"
                                onClick={() => keycloak.login()}
                            />
                        )}
                    </div>
                </div>
            </header>
            {authenticated && activePopup === "collections" && (
                <CollectionsPopup onClose={closePopup}/>
            )}
            {authenticated && activePopup === "profile" && profile && (
                <ProfileDetails
                    profile={profile}
                    onClose={closePopup}
                />
            )}
            <main>
                <Outlet/>
            </main>
        </div>
    );
}
