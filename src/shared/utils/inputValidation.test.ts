import {describe, expect, it} from "vitest";
import {INPUT_RULES, sanitizeInput} from "./inputValidation";

describe("inputValidation", () => {
    it("keeps valid name and removes unsupported characters", () => {
        expect(sanitizeInput("Test O'Name-Name. #42@", INPUT_RULES.name))
            .toBe("Test O'Name-Name. ");
    });

    it("keeps valid title and removes unsupported characters", () => {
        expect(sanitizeInput("Test Title: 2 - Test's Cut #[]", INPUT_RULES.title))
            .toBe("Test Title: 2 - Test's Cut ");
    });

    it("keeps only digits for years", () => {
        expect(sanitizeInput("19a9-3", INPUT_RULES.year)).toBe("1993");
    });
});
