import axios from "axios";

export const apiClient = axios.create({baseURL: import.meta.env.VITE_BACKEND_API_URL});

export const mediaClient = axios.create({baseURL: import.meta.env.VITE_MEDIA_API_URL});