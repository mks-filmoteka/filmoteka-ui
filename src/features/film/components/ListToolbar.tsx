import * as React from "react";
import {SORT_BY, SORT_DIR} from "../constants/constants.ts";

type Props = {
    filterOpen: boolean;
    setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
    sortParams: SortParam[];
    setSort: (sort: SortParam[]) => void
    view: string;
    setView: (view: string) => void;
    onSave?: () => void;
    onCancel?: () => void;
    saveDisabled?: boolean;
    cancelDisabled?: boolean;
};

type SortParam = {
    by?: string;
    dir?: string;
};

function getSortIndicator(sort: SortParam | undefined) {
    if (!sort) {
        return "⇅";
    }
    return sort.dir === SORT_DIR[0] ? "↑" : "↓";
}

export function ListToolbar(props: Readonly<Props>) {
    const {
        filterOpen,
        setFilterOpen,
        sortParams,
        setSort,
        view,
        setView,
        onSave,
        onCancel,
        saveDisabled,
        cancelDisabled
    } = props;
    const toggleSort = (by: string) => {
        const existingSort = sortParams.find(s => s.by === by);
        if (!existingSort) {
            setSort([...sortParams, {by, dir: SORT_DIR[0]}]);
            return;
        }
        if (existingSort.dir === SORT_DIR[0]) {
            setSort(sortParams.map(s => s.by === by ? {...s, dir: SORT_DIR[1]} : s));
            return;
        }
        setSort(sortParams.filter(s => s.by !== by));
    };
    const titleSort = sortParams.find(s => s.by === SORT_BY[0]);
    const yearSort = sortParams.find(s => s.by === SORT_BY[1]);
    const titleSortIndicator = getSortIndicator(titleSort);
    const yearSortIndicator = getSortIndicator(yearSort);

    return (
        <div className="navigation toolbar">

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
                    className={titleSort ? "active" : ""}
                    onClick={() => toggleSort(SORT_BY[0])}
                >
                    Title {titleSortIndicator}
                </button>
                <button
                    className={yearSort ? "active" : ""}
                    onClick={() => toggleSort(SORT_BY[1])}
                >
                    Year {yearSortIndicator}
                </button>
            </div>

            {onSave && onCancel && (
                <>
                    <button
                        title="Save films"
                        onClick={onSave}
                        disabled={saveDisabled}
                    >
                        ✔
                    </button>
                    <button
                        style={{marginRight: "30px"}}
                        title="Cancel films"
                        onClick={onCancel}
                        disabled={cancelDisabled}
                    >
                        ✖
                    </button>
                </>
            )}

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
                style={{paddingRight: "1px"}}
                className={view === "grid" ? "active" : ""}
            >
                ▦
            </button>
        </div>
    );
}
