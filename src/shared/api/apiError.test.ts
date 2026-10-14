import { describe, expect, it } from "vitest";
import { isNotFoundError } from "./apiError.ts";

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
