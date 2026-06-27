import type {ApiErrorDetail} from "./ApiErrorDetail.ts";

export interface ApiError {
    timestamp: string;
    status: number;
    message: string;
    path: string;
    code: string;
    errorDetails?: ApiErrorDetail[];
}