import axios, {AxiosHeaders, type AxiosInstance} from "axios";

export const CORRELATION_ID_HEADER = "X-Correlation-Id";

export const apiClient = axios.create({baseURL: import.meta.env.VITE_BACKEND_API_URL});
addCorrelationIdInterceptor(apiClient);

export const mediaClient = axios.create({baseURL: import.meta.env.VITE_MEDIA_API_URL});
addCorrelationIdInterceptor(mediaClient);

export function addCorrelationIdInterceptor(client: AxiosInstance) {
    client.interceptors.request.use((config) => {
        config.headers = AxiosHeaders.from(config.headers);
        config.headers.set(CORRELATION_ID_HEADER, crypto.randomUUID());
        return config;
    });
}