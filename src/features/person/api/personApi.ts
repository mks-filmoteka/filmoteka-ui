import { catalogClient } from "../../../shared/api/client.ts";
import type { Person } from "../types/person.ts";
import type { PersonRequest } from "../types/personRequest.ts";

export async function getPersonById(id: number) {
    const response = await catalogClient.get<Person>(`/people/${id}`);
    return response.data;
}

export async function updatePerson(id: number, request: PersonRequest) {
    const response = await catalogClient.put<Person>(`/people/${id}`, request);
    return response.data;
}
