export function sanitizeInput(value: string, regex: RegExp): string {
    return value.replace(regex, "");
}

export const NAME_INVALID_CHARS = /[^\p{L}\p{M}\s'.-]/gu;
export const TITLE_INVALID_CHARS = /[^\p{L}\p{M}\p{N}\s:,·!?'().-]/gu;
export const YEAR_INVALID_CHARS = /\D/g;

export const INPUT_RULES = {
    name: NAME_INVALID_CHARS,
    title: TITLE_INVALID_CHARS,
    year: YEAR_INVALID_CHARS
} as const;