import {Outlet, useNavigate} from "react-router-dom";
import {useState} from "react";


export function AppLayout() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    return (
        <div>
            <header>
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={() => navigate("/films")} title="Home">
                            <img src="/favicon.svg" alt="Home" className="home-button-img" />
                        </button>
                    </div>

                    <div className="header-center">
                        <input
                            id="title-search"
                            aria-label="Search films"
                            className="search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search films..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    navigate(`/films?title=${search}&page=1`);
                                    setSearch("");
                                }
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