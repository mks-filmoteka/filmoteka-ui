import {MAX_YEAR, MIN_YEAR, YEARS} from "../constants/constants.ts";
import {useEffect, useRef, useState} from "react";

type Props = {
    value?: number;
    title: string;
    inputValue: string;
    setInputValue: (v: string) => void;
    setValue: (v?: number) => void;
};

export function DropdownFilter({value, title, inputValue, setValue, setInputValue}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && yearDropdownRef.current) {
            const index = YEARS.indexOf(value ?? 2000);
            yearDropdownRef.current.scrollTop = index * 19;
        }
    }, [open, value]);

    useEffect(() => {
        setInputValue(value?.toString() ?? "");
    }, [setInputValue, value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div
            className="filter-year-picker"
            ref={wrapperRef}
        >
            <input
                value={inputValue}
                placeholder={title}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(o => !o);
                }}
                onChange={(e) =>
                    setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        const num = Number(inputValue);
                        if (Number.isFinite(num) && num >= MIN_YEAR && num <= MAX_YEAR) {
                            setValue(num);
                        } else {
                            setValue();
                            setInputValue("");
                        }
                        setOpen(false);
                    }
                }}
            />
            {(value !== undefined || inputValue !== "") && (
                <button
                    className="input-clear"
                    onClick={(e) => {
                        e.stopPropagation();
                        setValue();
                        setInputValue("");
                    }}
                >
                    ×
                </button>
            )}
            {open && (
                <div
                    ref={yearDropdownRef}
                    className="filter-year-dropdown"
                >
                    {YEARS.map(y => (
                        <div key={y} onClick={() => {
                            setValue(y);
                            setInputValue(String(y));
                            setOpen(false);
                        }}>
                            {y}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}