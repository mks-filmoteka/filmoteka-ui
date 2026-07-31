import axios, {AxiosHeaders, type AxiosInstance} from "axios";

export const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
export const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL;
export const CORRELATION_ID_HEADER = "X-Correlation-Id";

export const catalogClient = axios.create({baseURL: CATALOG_API_URL});
addCorrelationIdInterceptor(catalogClient);

export const mediaClient = axios.create({baseURL: MEDIA_API_URL});
addCorrelationIdInterceptor(mediaClient);

export function addCorrelationIdInterceptor(client: AxiosInstance) {
    client.interceptors.request.use((config) => {
        config.headers = AxiosHeaders.from(config.headers);
        config.headers.set(CORRELATION_ID_HEADER, crypto.randomUUID());
        return config;
    });
}