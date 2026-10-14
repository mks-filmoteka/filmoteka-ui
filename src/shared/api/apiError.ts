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

const MAX_RETRIES = 3;

export function shouldRetryRequest(failureCount: number, error: Error): boolean {
    const status = (error as ErrorWithResponseData).response?.status;
    if (status !== undefined && status >= 400 && status < 500) {
        return false;
    }
    return failureCount < MAX_RETRIES;
}

export function getApiError(error: Error): ApiError | Error {
    const responseData = (error as ErrorWithResponseData).response?.data;

    return isApiError(responseData) ? responseData : error;
}
