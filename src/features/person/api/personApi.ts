import {catalogClient} from "../../../shared/api/client.ts";
import type {Person} from "../types/person.ts";
import type {PersonRequest} from "../types/personRequest.ts";

export async function getPersonById(type: "actor" | "director", id: string) {
    const response = await catalogClient.get<Person>(`/${type}s/${id}`);
    return response.data;
}

export async function updatePerson(type: "actor" | "director", id: string, request: PersonRequest) {
    const response = await catalogClient.put<Person>(`/${type}s/${id}`, request);
    return response.data;
}