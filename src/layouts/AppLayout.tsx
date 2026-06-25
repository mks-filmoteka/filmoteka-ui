import {Outlet, useNavigate} from "react-router-dom";
import {useState} from "react";
import {INPUT_RULES} from "../shared/utils/inputValidation.ts";
import {TextInput} from "../shared/components/TextInput.tsx";

export function AppLayout() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    return (
        <div>
            <header>
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