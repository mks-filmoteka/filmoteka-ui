import axios, {AxiosHeaders, type AxiosInstance} from "axios";
import {keycloak} from "../../auth/keycloak.ts";

export const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;
export const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL;
export const USER_API_URL = import.meta.env.VITE_USER_API_URL;
export const CORRELATION_ID_HEADER = "X-Correlation-Id";

export const catalogClient = axios.create({baseURL: CATALOG_API_URL});
addCorrelationIdInterceptor(catalogClient);
addAuthInterceptor(catalogClient);

export const mediaClient = axios.create({baseURL: MEDIA_API_URL});
addCorrelationIdInterceptor(mediaClient);
addAuthInterceptor(mediaClient);

export const userClient = axios.create({baseURL: USER_API_URL})
addCorrelationIdInterceptor(userClient);
addAuthInterceptor(userClient);

export function addCorrelationIdInterceptor(client: AxiosInstance) {
    client.interceptors.request.use((config) => {
        config.headers = AxiosHeaders.from(config.headers);
        config.headers.set(CORRELATION_ID_HEADER, crypto.randomUUID());
        return config;
    });
}

export function addAuthInterceptor(client: AxiosInstance) {
    client.interceptors.request.use(async config => {
        if (!keycloak.authenticated) {
            return config;
        }
        await keycloak.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
        return config;
    });
}