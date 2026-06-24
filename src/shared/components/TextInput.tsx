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
    required?: boolean;
    className?: string;
    onEnter?: () => void;
    onClick?: React.MouseEventHandler<HTMLInputElement>;
};

export function TextInput(props: Readonly<Props>) {
    const {
        id,
        ariaLabel,
        value,
        onChange,
        regex,
        maxLength,
        placeholder,
        disabled,
        required,
        className,
        onEnter,
        onClick
    } = props

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;
        if (regex) {
            newValue = sanitizeInput(newValue, regex);
        }
        onChange(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onEnter?.();
        }
    };

    return (
        <input
            id={id}
            aria-label={ariaLabel}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            onClick={onClick}
            className={className}
        />
    );
}