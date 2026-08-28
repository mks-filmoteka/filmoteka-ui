import {TextInput} from "../../../shared/components/TextInput.tsx";
import {INPUT_RULES} from "../../../shared/utils/inputValidation.ts";
import {YEARS} from "../constants/constants.ts";

export type SelectRow<T extends string> = {
    id: string;
    value: T;
};

export type PersonNameRow = {
    id: string;
    name: string;
};

type ReleaseYearFieldProps = {
    value: number;
    onChange: (value: number) => void;
};

type SelectArrayFieldProps<T extends string> = {
    label: string;
    rows: ReadonlyArray<SelectRow<T>>;
    options: readonly T[];
    addLabel: string;
    maxRows: number;
    onAdd: () => void;
    onChange: (rowId: string, value: T) => void;
    onRemove: (rowId: string) => void;
};

type PersonNameArrayFieldProps = {
    rows: ReadonlyArray<PersonNameRow>;
    inputIdPrefix: string;
    ariaLabelPrefix: string;
    placeholder: string;
    addLabel: string;
    maxRows: number;
    onAdd: () => void;
    onChange: (rowId: string, name: string) => void;
    onRemove: (rowId: string) => void;
};

export function ReleaseYearField({value, onChange}: Readonly<ReleaseYearFieldProps>) {
    return (
        <div>
            <span>Year</span>
            <div className="array-editor">
                <div className="array-editor-row">
                    <select
                        value={value}
                        onChange={(event) => onChange(Number(event.target.value))}
                    >
                        <option value={0} disabled>
                            select
                        </option>
                        {YEARS.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export function SelectArrayField<T extends string>(props: Readonly<SelectArrayFieldProps<T>>) {
    const {label, rows, options, addLabel, maxRows, onAdd, onChange, onRemove} = props;
    const selectedValues = new Set(rows.map(row => row.value));

    return (
        <div>
            <span>{label}</span>
            <div className="array-editor">
                {rows.map(row => (
                    <div key={row.id} className="array-editor-row">
                        <select
                            value={row.value}
                            onChange={(event) => onChange(row.id, event.target.value as T)}
                        >
                            {options.map(option => (
                                <option
                                    key={option}
                                    value={option}
                                    disabled={selectedValues.has(option)}
                                >
                                    {option}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            title={`Remove ${label.toLowerCase()}`}
                            onClick={() => onRemove(row.id)}
                        >
                            ✖
                        </button>
                    </div>
                ))}

                {rows.length < maxRows && (
                    <button type="button" onClick={onAdd}>
                        {addLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

export function PersonNameArrayField(props: Readonly<PersonNameArrayFieldProps>) {
    const {
        rows,
        inputIdPrefix,
        ariaLabelPrefix,
        placeholder,
        addLabel,
        maxRows,
        onAdd,
        onChange,
        onRemove
    } = props;

    return (
        <div className="array-editor">
            {rows.map((row, position) => (
                <div key={row.id} className="array-editor-row">
                    <TextInput
                        id={`${inputIdPrefix}-${position}`}
                        ariaLabel={`${ariaLabelPrefix} ${position}`}
                        value={row.name}
                        maxLength={100}
                        placeholder={placeholder}
                        regex={INPUT_RULES.name}
                        onChange={(value) => onChange(row.id, value)}
                    />
                    <button
                        type="button"
                        title={`Remove ${ariaLabelPrefix} ${position}`}
                        onClick={() => onRemove(row.id)}
                        disabled={rows.length <= 1}
                    >
                        ✖
                    </button>
                </div>
            ))}
            {rows.length < maxRows && (
                <button type="button" onClick={onAdd}>
                    {addLabel}
                </button>
            )}
        </div>
    );
}
