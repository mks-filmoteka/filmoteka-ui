export type Country = typeof COUNTRIES[number];

export const COUNTRIES = [
    "USA", "United Kingdom", "France", "Germany", "Italy", "Spain", "Japan", "South Korea",
    "China", "India", "Canada", "Australia", "New Zealand"];

export function isCountry(value: string): value is Country {
    return (COUNTRIES as readonly string[]).includes(value);
}