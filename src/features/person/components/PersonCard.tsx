import type { ReactNode } from "react";

type Props = {
    photo: ReactNode;
    name: ReactNode;
    details: ReactNode;
    controls?: ReactNode;
    children?: ReactNode;
};

export function PersonCard({ photo, name, details, controls, children }: Readonly<Props>) {
    return (
        <section className="person-card">
            <div className="person-photo">{photo}</div>
            <div className="person-info">
                <h1>{name}</h1>
                <div className="details-column">{details}</div>
                {children}
                <div className="person-controls">{controls}</div>
            </div>
        </section>
    );
}
