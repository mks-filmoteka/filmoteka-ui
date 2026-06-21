import * as React from "react";
import {SORT_BY, SORT_DIR} from "../constants/constants.ts";

type Props = {
    filterOpen: boolean;
    setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
    sortBy?: string;
    sortDir?: string;
    setSort: (by?: string, dir?: string) => void;
    view: string;
    setView: (view: string) => void;
};

export function ListToolbar(props: Readonly<Props>) {
    const {filterOpen, setFilterOpen, sortBy, sortDir, setSort, view, setView} = props;
    const toggleSort = (by: string) => {
        if (sortBy !== by) {
            setSort(by, SORT_DIR[0]);
            return;
        }
        if (sortDir === SORT_DIR[0]) {
            setSort(by, SORT_DIR[1]);
            return;
        }
        setSort();
    };

    return (
        <div className="navigation navigation-top">

            {/* FILTRATION */}
            <button
                onClick={() => setFilterOpen(prev => !prev)}
                title="Filters"
                className={filterOpen ? "active" : ""}
            >
                ⚶
            </button>

            {/* SORT */}
            <div className="sort-section">
                <button
                    className={`${
                        sortBy === SORT_BY[0] ? "active" : ""
                    }`}
                    onClick={() => toggleSort(SORT_BY[0])}
                >
                    Title {sortBy === SORT_BY[0] ? (sortDir === SORT_DIR[0] ? "↑" : "↓") : "⇅"}
                </button>
                <button
                    className={`${
                        sortBy === SORT_BY[1] ? "active" : ""
                    }`}
                    onClick={() => toggleSort(SORT_BY[1])}
                >
                    Year {sortBy === SORT_BY[1] ? (sortDir === SORT_DIR[0] ? "↑" : "↓") : "⇅"}
                </button>
            </div>

            {/* VIEW */}
            <button
                onClick={() => setView("list")}
                title="List view"
                className={view === "list" ? "active" : ""}
            >
                ☰
            </button>

            <button
                onClick={() => setView("grid")}
                title="Grid view"
                className={view === "grid" ? "active" : ""}
            >
                ▦
            </button>
        </div>
    );
}