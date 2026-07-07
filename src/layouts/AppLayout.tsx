import {Outlet, useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {INPUT_RULES} from "../shared/utils/inputValidation.ts";
import {TextInput} from "../shared/components/TextInput.tsx";

export function AppLayout() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [showHeader, setShowHeader] = useState(true);
    const previousScrollY = useRef(0);

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
                        {/*  */}
                    </div>
                </div>
            </header>
            <main>
                <Outlet/>
            </main>
        </div>
    );
}