import { describe, expect, it } from "vitest";
import { formatDate, getAge } from "./lifespan";

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
