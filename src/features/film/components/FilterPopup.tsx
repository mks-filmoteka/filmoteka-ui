import {COUNTRIES, GENRES} from "../constants/constants.ts";
import {MultiToggleFilter} from "./MultiToggleFilter.tsx";
import {DropdownFilter} from "./DropdownFilter.tsx";
import {useState} from "react";

type Props = {
    filterOpen: boolean;
    genres: string[];
    countries: string[];
    yearFrom?: number;
    yearTo?: number;

    setFilterOpen: (v: boolean) => void;
    setGenres: (g: string[]) => void;
    setCountries: (c: string[]) => void;
    setYearFrom: (v?: number) => void;
    setYearTo: (v?: number) => void;
    resetYears: () => void;
};

export function FilterPopup(props: Readonly<Props>) {
    const {
        filterOpen, genres, countries, yearFrom, yearTo,
        setFilterOpen, setGenres, setCountries, setYearFrom, setYearTo, resetYears
    } = props;
    const [yearFromInput, setYearFromInput] = useState("");
    const [yearToInput, setYearToInput] = useState("");

    if (!filterOpen) return null;

    const toggleItem = (
        value: string,
        current: string[],
        set: (v: string[]) => void
    ) => {
        if (current.includes(value)) {
            set(current.filter(v => v !== value));
        } else {
            set([...current, value]);
        }
    };

    return (
        <div
            className="filter-overlay"
            onClick={() => {
                setFilterOpen(false)
            }}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    setFilterOpen(false);
                }
            }}
            role="presentation"
        >
            <div
                className="filter-popup"
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                {/* GENRES FILTER */}
                <MultiToggleFilter
                    title="Genres"
                    options={GENRES}
                    selected={genres}
                    onToggle={(g) => toggleItem(g, genres, setGenres)}
                    onReset={() => setGenres([])}
                />

                <hr/>

                {/* RELEASE YEAR FILTER SECTION */}
                <div className="filter-options">
                    <div className="filter-section-header">
                        <span>Release year:</span>
                        <button onClick={() => {
                            resetYears();
                            setYearFromInput("");
                            setYearToInput("");
                        }}>
                            ↺
                        </button>
                    </div>

                    {/* YEAR FROM */}
                    <DropdownFilter
                        title={"From"}
                        value={yearFrom}
                        inputValue={yearFromInput}
                        setValue={setYearFrom}
                        setInputValue={setYearFromInput}
                    />

                    <span> — </span>

                    {/* YEAR TO */}
                    <DropdownFilter
                        title={"To"}
                        value={yearTo}
                        inputValue={yearToInput}
                        setValue={setYearTo}
                        setInputValue={setYearToInput}
                    />
                </div>

                <hr/>

                {/* COUNTRIES FILTER */}
                <MultiToggleFilter
                    title="Countries"
                    options={COUNTRIES}
                    selected={countries}
                    onToggle={(c) => toggleItem(c, countries, setCountries)}
                    onReset={() => setCountries([])}
                />
            </div>
        </div>
    )
}