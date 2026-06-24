import { useParams } from "react-router-dom";

export function useRequiredParam(key: string): string {
    const params = useParams();
    const value = params[key];
    if (!value) {
        throw new Error(`Missing required route parameter: ${key}`);
    }
    return value;
}