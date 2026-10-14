import { describe, expect, it } from "vitest";
import { getApiError, getErrorMessage, isNotFoundError, shouldRetryRequest } from "./apiError.ts";

function errorWithStatus(status: number) {
    return Object.assign(new Error("Request failed"), { response: { status } });
}

describe("isNotFoundError", () => {
    it("recognises a 404 response", () => {
        expect(isNotFoundError(errorWithStatus(404))).toBe(true);
    });

    it("does not treat other responses as not found", () => {
        expect(isNotFoundError(errorWithStatus(500))).toBe(false);
    });

    it("does not treat errors without a response as not found", () => {
        expect(isNotFoundError(new Error("Network Error"))).toBe(false);
    });
});

describe("shouldRetryRequest", () => {
    it("does not retry client errors", () => {
        expect(shouldRetryRequest(0, errorWithStatus(404))).toBe(false);
        expect(shouldRetryRequest(0, errorWithStatus(400))).toBe(false);
        expect(shouldRetryRequest(0, errorWithStatus(401))).toBe(false);
    });

    it("retries server errors and network failures up to three times", () => {
        expect(shouldRetryRequest(0, errorWithStatus(503))).toBe(true);
        expect(shouldRetryRequest(2, new Error("Network Error"))).toBe(true);
        expect(shouldRetryRequest(3, errorWithStatus(503))).toBe(false);
    });
});

describe("getErrorMessage", () => {
    function errorWithResponse(status: number, data?: unknown) {
        return Object.assign(new Error(`Request failed with status code ${status}`), { response: { status, data } });
    }

    function errorWithCode(code: string) {
        return Object.assign(new Error("axios message"), { code });
    }

    it("explains a network failure", () => {
        expect(getErrorMessage(errorWithCode("ERR_NETWORK"))).toBe(
            "Can't reach the server. Check your connection and try again.",
        );
    });

    it("explains a timeout", () => {
        expect(getErrorMessage(errorWithCode("ECONNABORTED"))).toBe(
            "The server took too long to respond. Please try again.",
        );
    });

    it("hides server error details", () => {
        expect(getErrorMessage(errorWithResponse(503, "<html>Bad gateway</html>"))).toBe(
            "Something went wrong on the server. Please try again later.",
        );
    });

    it("explains missing sign-in and missing permission", () => {
        expect(getErrorMessage(errorWithResponse(401))).toBe("Please sign in to continue.");
        expect(getErrorMessage(errorWithResponse(403))).toBe("You don't have permission to do this.");
    });

    it("keeps the server message for other client errors", () => {
        const error = errorWithResponse(409, { status: 409, message: "Film already exists" });

        expect(getErrorMessage(error)).toBe("Film already exists");
        expect(getErrorMessage(getApiError(error))).toBe("Film already exists");
    });

    it("falls back to a generic message when a client error has no server message", () => {
        expect(getErrorMessage(errorWithResponse(400))).toBe("The request could not be completed.");
    });

    it("keeps the message of an error that did not come from a request", () => {
        expect(getErrorMessage(new Error("Something specific"))).toBe("Something specific");
    });
});
