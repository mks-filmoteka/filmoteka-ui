import { describe, expect, it } from "vitest";
import { formatDate, getAge, getLifespanError } from "./lifespan";

describe("getAge", () => {
    it("counts full years up to the end date", () => {
        expect(getAge("1930-05-31", new Date(2026, 4, 30))).toBe(95);
        expect(getAge("1930-05-31", new Date(2026, 4, 31))).toBe(96);
    });

    it("counts up to the death date when given", () => {
        expect(getAge("1930-05-31", "2020-01-01")).toBe(89);
    });
});

describe("formatDate", () => {
    it("shows the day, month name and year without shifting the day", () => {
        expect(formatDate("1930-05-31")).toBe("31 May 1930");
    });
});

describe("getLifespanError", () => {
    const today = new Date(2026, 9, 17);

    it("accepts missing and valid dates", () => {
        expect(getLifespanError(null, null, today)).toBeUndefined();
        expect(getLifespanError("1930-05-31", null, today)).toBeUndefined();
        expect(getLifespanError("1930-05-31", "2020-01-01", today)).toBeUndefined();
        expect(getLifespanError("1930-05-31", "1930-05-31", today)).toBeUndefined();
    });

    it("rejects dates in the future", () => {
        expect(getLifespanError("2026-10-18", null, today)).toBe("Dates must not be in the future");
        expect(getLifespanError(null, "2026-10-18", today)).toBe("Dates must not be in the future");
    });

    it("rejects dates before 1850", () => {
        expect(getLifespanError("1849-12-31", null, today)).toBe("Dates must not be before 1850");
    });

    it("rejects a death date before the birth date", () => {
        expect(getLifespanError("1930-05-31", "1930-05-30", today)).toBe("Death date must not be before birth date");
    });
});
