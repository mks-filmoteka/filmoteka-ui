import * as React from "react";
import { SORT_BY, SORT_DIR } from "../constants/constants.ts";
import { Icon, type IconName } from "../../../shared/components/Icon.tsx";
import { IconButton } from "../../../shared/components/IconButton.tsx";

type Props = {
    filterOpen: boolean;
    setFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
    sortParams: SortParam[];
    setSort: (sort: SortParam[]) => void;
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

function getSortIndicator(sort: SortParam | undefined): IconName {
    if (!sort) {
        return "sort";
    }
    return sort.dir === SORT_DIR[0] ? "sortAsc" : "sortDesc";
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
        cancelDisabled,
    } = props;
    const toggleSort = (by: string) => {
        const existingSort = sortParams.find((s) => s.by === by);
        if (!existingSort) {
            setSort([...sortParams, { by, dir: SORT_DIR[0] }]);
            return;
        }
        if (existingSort.dir === SORT_DIR[0]) {
            setSort(sortParams.map((s) => (s.by === by ? { ...s, dir: SORT_DIR[1] } : s)));
            return;
        }
        setSort(sortParams.filter((s) => s.by !== by));
    };
    const titleSort = sortParams.find((s) => s.by === SORT_BY[0]);
    const yearSort = sortParams.find((s) => s.by === SORT_BY[1]);
    const titleSortIndicator = getSortIndicator(titleSort);
    const yearSortIndicator = getSortIndicator(yearSort);

    return (
        <div className="navigation toolbar">
            {/* FILTRATION */}
            <IconButton
                icon="filter"
                label="Filters"
                onClick={() => setFilterOpen((prev) => !prev)}
                className={filterOpen ? "active" : undefined}
            />

            {/* SORT */}
            <div className="sort-section">
                <button className={titleSort ? "active" : ""} onClick={() => toggleSort(SORT_BY[0])}>
                    Title <Icon name={titleSortIndicator} />
                </button>
                <button className={yearSort ? "active" : ""} onClick={() => toggleSort(SORT_BY[1])}>
                    Year <Icon name={yearSortIndicator} />
                </button>
            </div>

            {onSave && onCancel && (
                <>
                    <IconButton icon="accept" label="Save" onClick={onSave} disabled={saveDisabled} />
                    <IconButton
                        icon="cancel"
                        label="Cancel"
                        style={{ marginRight: "30px" }}
                        onClick={onCancel}
                        disabled={cancelDisabled}
                    />
                </>
            )}

            {/* VIEW */}
            <IconButton
                icon="list"
                label="List view"
                onClick={() => setView("list")}
                className={view === "list" ? "active" : undefined}
            />

            <IconButton
                icon="grid"
                label="Grid view"
                onClick={() => setView("grid")}
                style={{ paddingRight: "1px" }}
                className={view === "grid" ? "active" : undefined}
            />
        </div>
    );
}
