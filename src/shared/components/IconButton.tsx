import type {ButtonHTMLAttributes} from "react";
import {Icon, type IconName} from "./Icon.tsx";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
    icon: IconName;
    label: string;
};

export function IconButton(props: Readonly<Props>) {
    const {
        icon,
        label,
        title = label,
        type = "button",
        className,
        ...buttonProps
    } = props;
    const classes = ["icon-button", className].filter(Boolean).join(" ");

    return (
        <button
            {...buttonProps}
            type={type}
            className={classes}
            aria-label={label}
            title={title}
        >
            <Icon name={icon}/>
        </button>
    );
}
