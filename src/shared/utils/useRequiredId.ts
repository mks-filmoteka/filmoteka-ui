import { useParams } from "react-router";

const ID_PATTERN = /^[1-9]\d*$/;

export class InvalidIdError extends Error {
    constructor(value: string) {
        super(`Invalid id: ${value}`);
    }
}

export function useRequiredId(): number {
    const value = useParams().id;

    if (value === undefined) {
        throw new Error("Missing required route parameter: id");
    }
    const id = Number(value);
    if (ID_PATTERN.test(value) && Number.isSafeInteger(id)) {
        return id;
    } else {
        throw new InvalidIdError(value);
    }
}
