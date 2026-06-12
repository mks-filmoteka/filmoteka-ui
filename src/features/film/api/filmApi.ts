import apiClient from "../../../shared/api/client.ts";
import type { Page } from "../types/page.ts";
import type { Film } from "../types/film.ts";


export async function getFilms() {
    const response = await apiClient.get<Page<Film>>("/films");
    return response.data;
}