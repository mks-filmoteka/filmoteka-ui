function parseDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function getAge(birthDate: string, endDate: string | Date = new Date()) {
    const birth = parseDate(birthDate);
    const end = typeof endDate === "string" ? parseDate(endDate) : endDate;
    const hadBirthday =
        end.getMonth() > birth.getMonth() || (end.getMonth() === birth.getMonth() && end.getDate() >= birth.getDate());
    return end.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1);
}

export function formatDate(date: string) {
    return parseDate(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function getLifespanError(birthDate: string | null, deathDate: string | null, today = new Date()) {
    const dates = [birthDate, deathDate].filter((date): date is string => !!date).map(parseDate);
    if (dates.some((date) => date > today)) return "Dates must not be in the future";
    if (dates.some((date) => date.getFullYear() < 1850)) return "Dates must not be before 1850";
    if (birthDate && deathDate && deathDate < birthDate) return "Death date must not be before birth date";
    return undefined;
}
