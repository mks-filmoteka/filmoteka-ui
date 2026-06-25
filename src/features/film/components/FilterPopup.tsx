import {MultiToggleFilter} from "./MultiToggleFilter.tsx";
import {DropdownFilter} from "./DropdownFilter.tsx";
import {useState} from "react";
import "../../../shared/styles/filter.css";
import {GENRES} from "../types/genre.ts";
import {COUNTRIES} from "../types/country.ts";

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
                    onToggle={setGenres}
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
                        id={"year-from"}
                        placeholder={"From"}
                        value={yearFrom}
                        inputValue={yearFromInput}
                        setValue={setYearFrom}
                        setInputValue={setYearFromInput}
                    />

                    <span> — </span>

                    {/* YEAR TO */}
                    <DropdownFilter
                        id={"year-to"}
                        placeholder={"To"}
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
                    onToggle={setCountries}
                    onReset={() => setCountries([])}
                />
            </div>
        </div>
    )
}