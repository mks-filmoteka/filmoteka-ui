import type { ApiError } from "../types/ApiError.ts";

type ErrorWithResponseData = Error & {
    response?: {
        status?: number;
        data?: unknown;
    };
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isApiError(value: unknown): value is ApiError {
    return isObject(value) && typeof value.message === "string";
}

export function isNotFoundError(error: Error): boolean {
    return (error as ErrorWithResponseData).response?.status === 404;
}

export function getApiError(error: Error): ApiError | Error {
    const responseData = (error as ErrorWithResponseData).response?.data;

    return isApiError(responseData) ? responseData : error;
}
