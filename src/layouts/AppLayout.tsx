import {Outlet, useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {INPUT_RULES} from "../shared/utils/inputValidation.ts";
import {TextInput} from "../shared/components/TextInput.tsx";
import {useAuth} from "../auth/useAuth.ts";
import {keycloak} from "../auth/keycloak.ts";
import {CollectionsPopup} from "../features/collection/components/CollectionsPopup.tsx";
import {useProfile} from "../features/profile/queries/useProfile.ts";
import {ProfileDetails} from "../features/profile/components/ProfileDetails.tsx";

export function AppLayout() {
    const navigate = useNavigate();
    const {authenticated} = useAuth();
    const {data: profile} = useProfile();
    const [search, setSearch] = useState("");
    const [collectionsOpen, setCollectionsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const previousScrollY = useRef(0);
    const openProfileDetails = () => setProfileOpen(true);
    const closeProfileDetails = () => setProfileOpen(false);

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
                            <button
                                onClick={() => setCollectionsOpen(prev => !prev)}
                                title="Collections"
                            >
                                ★
                            </button>
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
                            <button
                                className="input-clear"
                                onClick={() => setSearch("")}
                            >
                                ×
                            </button>
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
                            <button
                                onClick={() => keycloak.logout({redirectUri: globalThis.location.origin})}
                                title="Logout"
                            >
                                ⏻
                            </button>
                        ) : (
                            <button onClick={() => keycloak.login()} title="Login">
                                ⏻
                            </button>
                        )}
                    </div>
                </div>
            </header>
            {authenticated && collectionsOpen && (
                <CollectionsPopup onClose={() => setCollectionsOpen(false)}/>
            )}
            {authenticated && profileOpen && profile && (
                <ProfileDetails
                    profile={profile}
                    onClose={closeProfileDetails}
                />
            )}
            <main>
                <Outlet/>
            </main>
        </div>
    );
}
