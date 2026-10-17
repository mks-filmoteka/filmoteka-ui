import type { ReactNode } from "react";
import Poster from "../../media/components/Poster.tsx";
import { getFileUrl } from "../../media/api/mediaApi.ts";
import type { Person } from "../types/person.ts";
import { formatDate, getAge } from "../utils/lifespan.ts";

type Props = {
    person: Person;
    name: ReactNode;
    roles: string;
    controls?: ReactNode;
    children?: ReactNode;
};

export function PersonDetails({ person, name, roles, controls, children }: Readonly<Props>) {
    const { birthDate, deathDate, placeOfBirth } = person;
    const lifespanNote = deathDate ? `, died in ${deathDate.slice(0, 4)}` : "";
    const born =
        birthDate && `${formatDate(birthDate)} (age ${getAge(birthDate, deathDate ?? undefined)}${lifespanNote})`;

    return (
        <section className="person-card">
            <div className="person-photo">
                <Poster
                    src={person.photoName ? getFileUrl(person.photoName) : null}
                    alt={person.name}
                    placeholderIcon="person"
                />
            </div>
            <div className="person-info">
                <h1>{name}</h1>
                <div className="details-column">
                    {roles && (
                        <div>
                            <span>Roles</span>
                            {roles}
                        </div>
                    )}
                    {born && (
                        <div>
                            <span>Born</span>
                            {born}
                        </div>
                    )}
                    {placeOfBirth && (
                        <div>
                            <span>Birthplace</span>
                            {placeOfBirth}
                        </div>
                    )}
                </div>
                {children}
                <div className="person-controls">{controls}</div>
            </div>
        </section>
    );
}
