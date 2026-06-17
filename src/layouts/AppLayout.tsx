import {Outlet} from "react-router-dom";
import {useState} from "react";
import {useFilmSearchParams} from "../features/film/queries/useFilmSearchParams.ts";


export function AppLayout() {
    const {title, setTitle} = useFilmSearchParams();
    const [search, setSearch] = useState("");
    const hasSearch = !!title;
    return (
        <div>
            <header>
                <div className="header-left">
                    {hasSearch && (
                        <button onClick={() => setTitle("")} title="Clear search">
                            ↺
                        </button>
                    )}
                </div>

                <div className="header-center">
                    <input
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search films..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setTitle(search);
                                setSearch("");
                            }
                        }}
                    />
                </div>
                <div className="header-right">
                    {/*  */}
                </div>
            </header>

            <main>
                <Outlet/>
            </main>
        </div>
    );
}