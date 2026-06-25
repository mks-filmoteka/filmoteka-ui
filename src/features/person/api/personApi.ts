import apiClient from "../../../shared/api/client.ts";
import type {Person} from "../types/person.ts";
import type {PersonForm} from "../types/personForm.ts";

export async function getPersonById(type: "actor" | "director", id: string) {
    const response = await apiClient.get<Person>(`/${type}s/${id}`);
    return response.data;
}

export async function updatePerson(type: "actor" | "director", id: string, request: PersonForm) {
    const response = await apiClient.put(`/${type}s/${id}`, request);
    return response.data;
}