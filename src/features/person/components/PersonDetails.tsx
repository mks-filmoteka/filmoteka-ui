import type { ReactNode } from "react";
import Poster from "../../media/components/Poster.tsx";
import { getFileUrl } from "../../media/api/mediaApi.ts";
import type { Person } from "../types/person.ts";
import { formatDate, getAge } from "../utils/lifespan.ts";
import { PersonCard } from "./PersonCard.tsx";

type Props = {
    person: Person;
    roles: string;
    controls?: ReactNode;
    children?: ReactNode;
};

export function PersonDetails({ person, roles, controls, children }: Readonly<Props>) {
    const { birthDate, deathDate, placeOfBirth } = person;
    const lifespanNote = deathDate ? `, died in ${deathDate.slice(0, 4)}` : "";
    const born =
        birthDate && `${formatDate(birthDate)} (age ${getAge(birthDate, deathDate ?? undefined)}${lifespanNote})`;

    return (
        <PersonCard
            photo={
                <Poster
                    src={person.photoName ? getFileUrl(person.photoName) : null}
                    alt={person.name}
                    placeholderIcon="person"
                />
            }
            name={person.name}
            details={
                <>
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
                </>
            }
            controls={controls}
        >
            {children}
        </PersonCard>
    );
}
