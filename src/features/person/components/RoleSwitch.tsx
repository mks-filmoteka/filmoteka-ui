export type Role = "actor" | "director";

type Props = {
    role: Role;
    actingCount: number;
    directingCount: number;
    onSelect: (role: Role) => void;
};

export function RoleSwitch({ role, actingCount, directingCount, onSelect }: Readonly<Props>) {
    if (actingCount === 0 || directingCount === 0) {
        return null;
    }

    const roleButton = (value: Role, label: string) => (
        <button
            type="button"
            className={role === value ? "active" : undefined}
            aria-pressed={role === value}
            onClick={() => onSelect(value)}
        >
            {label}
        </button>
    );

    return (
        <div className="navigation role-switch">
            {roleButton("actor", `actor (${actingCount})`)}
            {roleButton("director", `director (${directingCount})`)}
        </div>
    );
}
