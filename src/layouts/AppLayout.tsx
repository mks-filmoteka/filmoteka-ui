import {Outlet, useSearchParams} from "react-router-dom";
import {useState} from "react";

export function AppLayout() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const hasSearch = !!searchParams.get("title");
    const clearSearch = () => {
        setSearchParams(prev => {
            const params = new URLSearchParams(prev);
            params.delete("title");
            params.set("page", "1");
            return params;
        });
    };
    return (
        <div>
            <header>
                <div className="header-left">
                    {hasSearch && (
                        <button onClick={clearSearch} title="Clear search">
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
                            const params = new URLSearchParams(searchParams);
                            params.set("page", "1");
                            params.set("view", "grid")
                            if (search.trim()) {
                                params.set("title", search.trim());
                            } else {
                                params.delete("title");
                            }
                            setSearchParams(params);
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
                <Outlet />
            </main>
        </div>
    );
}