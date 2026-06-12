import apiClient from "./client.ts";

export async function getFilms() {
    const response = await apiClient.get("/films");
    return response.data;
}