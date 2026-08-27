import { useParams } from "react-router";

export function useRequiredParam(key: string): string {
    const params = useParams();
    const value = params[key];
    if (!value) {
        throw new Error(`Missing required route parameter: ${key}`);
    }
    return value;
}

export function useRequiredId(name: string): number {
    const value = useRequiredParam(name);
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error(`Invalid ${name}: ${value}`);
    }

    return id;
}
