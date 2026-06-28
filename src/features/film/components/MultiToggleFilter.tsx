type Props = {
    title: string;
    options: string[];
    selected: string[];
    onToggle: (value: string[]) => void;
    onReset: () => void;
};

export function MultiToggleFilter({title, options, selected, onToggle, onReset}: Readonly<Props>) {
    const toggleItem = (value: string,) => {
        if (selected.includes(value)) {
            onToggle(selected.filter(v => v !== value));
        } else {
            onToggle([...selected, value]);
        }
    };
    return (
        <div className="filter-options">
            <div className="filter-section-header">
                <span>{title}:</span>
                <button onClick={onReset}>
                    ↺
                </button>
            </div>
            {options.map(option => (
                <button
                    key={option}
                    className={`filter-options-button ${selected.includes(option) ? "active" : ""}`}
                    onClick={() => toggleItem(option)}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}