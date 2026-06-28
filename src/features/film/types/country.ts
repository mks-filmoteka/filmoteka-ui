export type Country = typeof COUNTRIES[number];

export const COUNTRIES = [
    "United States", "United Kingdom", "France", "Germany", "Italy", "Spain", "Poland", "Russia", "Soviet Union",
    "Japan", "South Korea", "China", "India", "Canada", "Australia", "New Zealand", "Mexico", "Brazil", "Argentina"
];

export function isCountry(value: string): value is Country {
    return (COUNTRIES as readonly string[]).includes(value);
}