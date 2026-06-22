import apiClient from "../../../shared/api/client.ts";
import type {Person} from "../types/person.ts";

export async function getPersonById(type: "actor" | "director",id: string) {
    const response = await apiClient.get<Person>(`/${type}s/${id}`);
    return response.data;
}