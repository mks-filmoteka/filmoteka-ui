import { describe, expect, it } from "vitest";
import { isNotFoundError, shouldRetryRequest } from "./apiError.ts";

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
