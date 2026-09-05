import type { ApiError } from "../types/ApiError.ts";
import type { ApiErrorDetail } from "../types/ApiErrorDetail.ts";

type Props = {
    error?: ApiError | Error;
    message?: string;
};

function getErrorDetails(error: ApiError | Error): ApiErrorDetail[] {
    if (!("errorDetails" in error) || !Array.isArray(error.errorDetails)) {
        return [];
    }

    return error.errorDetails;
}

export function ApiErrorMessage({ error, message }: Readonly<Props>) {
    if (!error) {
        return null;
    }

    const errorDetails = getErrorDetails(error);
    const displayMessage = message ? `${message}: ${error.message}` : error.message;

    return (
        <div className="api-error-message" role="alert">
            <div>{displayMessage}</div>
            {errorDetails.length > 0 && (
                <ul>
                    {errorDetails.map((detail, index) => (
                        <li key={`${detail.field ?? "detail"}-${detail.message}-${index}`}>
                            {detail.field ? `${detail.field}: ${detail.message}` : detail.message}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
