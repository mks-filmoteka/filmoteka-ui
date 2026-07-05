import {apiClient} from "../../../shared/api/client.ts";
import type {Person} from "../types/person.ts";
import type {PersonRequest} from "../types/personRequest.ts";

export async function getPersonById(type: "actor" | "director", id: string) {
    const response = await apiClient.get<Person>(`/${type}s/${id}`);
    return response.data;
}

export async function updatePerson(type: "actor" | "director", id: string, request: PersonRequest) {
    const response = await apiClient.put<Person>(`/${type}s/${id}`, request);
    return response.data;
}