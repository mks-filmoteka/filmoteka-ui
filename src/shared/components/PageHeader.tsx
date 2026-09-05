import type { ReactNode } from "react";

type Props = {
    title: ReactNode;
    meta?: ReactNode;
    controls?: ReactNode;
    children?: ReactNode;
};

export function PageHeader({ title, meta, controls, children }: Readonly<Props>) {
    return (
        <div className="page-title">
            <h1>{title}</h1>
            {children && <section>{children}</section>}
            <div>
                <div>{meta}</div>
                <div className="page-title-controls">{controls}</div>
            </div>
        </div>
    );
}
