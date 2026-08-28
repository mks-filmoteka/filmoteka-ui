import type {HTMLAttributes} from "react";

const ICONS = {
    create: "✚",
    accept: "✔",
    cancel: "✖",
    clear: "×",
    collection: "★",
    edit: "✎",
    delete: "🗑",
    filter: "⚶",
    list: "☰",
    grid: "▦",
    first: "❚❰",
    previous: "❰",
    next: "❱",
    last: "❱❚",
    power: "⏻",
    add: "+",
    remove: "-",
    reset: "↺",
    sort: "⇅",
    sortAsc: "↑",
    sortDesc: "↓"
} as const;

export type IconName = keyof typeof ICONS;

type Props = HTMLAttributes<HTMLSpanElement> & {
    name: IconName;
};

export function Icon({name, className, ...props}: Readonly<Props>) {
    const classes = ["icon", className].filter(Boolean).join(" ");

    return (
        <span className={classes} aria-hidden="true" {...props}>
            {ICONS[name]}
        </span>
    );
}
