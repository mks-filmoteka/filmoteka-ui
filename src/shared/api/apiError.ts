import { AxiosError } from "axios";
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

function messageForStatus(status: number | undefined): string | undefined {
    if (status === 401) {
        return "Please sign in to continue.";
    }
    if (status === 403) {
        return "You don't have permission to do this.";
    }
    if (status !== undefined && status >= 500) {
        return "Something went wrong on the server. Please try again later.";
    }
    return undefined;
}

export function getErrorMessage(error: ApiError | Error): string {
    if (!(error instanceof Error)) {
        return messageForStatus(error.status) ?? error.message;
    }

    const { response, code } = error as ErrorWithResponseData & { code?: string };
    if (response === undefined) {
        if (code === AxiosError.ERR_NETWORK) {
            return "Can't reach the server. Check your connection and try again.";
        }
        if (code === AxiosError.ECONNABORTED || code === AxiosError.ETIMEDOUT) {
            return "The server took too long to respond. Please try again.";
        }
        return error.message;
    }

    const serverMessage = isApiError(response.data) ? response.data.message : "The request could not be completed.";
    return messageForStatus(response.status) ?? serverMessage;
}
