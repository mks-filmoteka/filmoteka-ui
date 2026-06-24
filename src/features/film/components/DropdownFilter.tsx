import {MAX_YEAR, MIN_YEAR, YEARS} from "../constants/constants.ts";
import {useEffect, useRef, useState} from "react";
import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";

type Props = {
    id?: string;
    value?: number;
    placeholder: string;
    inputValue: string;
    setInputValue: (v: string) => void;
    setValue: (v?: number) => void;
};

export function DropdownFilter({id, value, placeholder, inputValue, setValue, setInputValue}: Readonly<Props>) {
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
            <TextInput
                id={id}
                ariaLabel="filter years"
                value={inputValue}
                maxLength={4}
                onChange={setInputValue}
                placeholder={placeholder}
                regex={INPUT_RULES.year}
                onEnter={() => {
                    const num = Number(inputValue);
                    if (Number.isFinite(num) && num >= MIN_YEAR && num <= MAX_YEAR) {
                        setValue(num);
                    } else {
                        setValue();
                        setInputValue("");
                    }
                    setOpen(false);
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(o => !o);
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