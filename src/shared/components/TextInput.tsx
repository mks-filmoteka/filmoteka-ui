import React from "react";
import { sanitizeInput } from "../utils/inputValidation";

type Props = {
    id?: string;
    ariaLabel?: string;
    value: string;
    onChange: (value: string) => void;
    regex?: RegExp;
    maxLength?: number;
    placeholder?: string;
    disabled?: boolean;
};

export function TextInput(props: Readonly<Props>) {
    const {id, ariaLabel, value, onChange, regex, maxLength, placeholder, disabled} = props

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        if (regex) {
            newValue = sanitizeInput(newValue, regex);
        }
        onChange(newValue);
    };

    return (
        <input
            id={id}
            aria-label={ariaLabel}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
        />
    );
}