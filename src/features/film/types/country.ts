export type Country = typeof COUNTRIES[number];

export const COUNTRIES = [
    "United States", "United Kingdom", "France", "Germany", "Italy", "Spain", "Poland", "Russia", "Soviet Union",
    "Czech Republic", "Ukraine", "Belarus", "Finland", "Sweden", "Ireland", "Bulgaria", "Hungary", "Japan",
    "South Korea", "China", "Thailand", "India", "Canada", "Indonesia", "Australia", "New Zealand", "Mexico", "Brazil",
    "Netherlands", "South Africa", "Argentina"
];

export function isCountry(value: string): value is Country {
    return (COUNTRIES as readonly string[]).includes(value);
}