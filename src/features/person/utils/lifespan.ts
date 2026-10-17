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
