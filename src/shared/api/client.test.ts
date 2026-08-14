import {AxiosHeaders, type AxiosAdapter, type AxiosInstance, type InternalAxiosRequestConfig} from "axios";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const CATALOG_API_URL = "http://localhost:8080/api/v1";
const MEDIA_API_URL = "http://localhost:8081/api/v1";
const USER_API_URL = "http://localhost:8082/api/v1";
const CORRELATION_ID = "00000000-0000-0000-0000-000000000000";
const ACCESS_TOKEN = "access-token";

const keycloakMock = vi.hoisted(() => ({
    authenticated: false,
    token: undefined as string | undefined,
    updateToken: vi.fn(async () => true)
}));

vi.mock("../../auth/keycloak.ts", () => ({
    keycloak: keycloakMock
}));

beforeEach(() => {
    vi.resetModules();
    keycloakMock.authenticated = false;
    keycloakMock.token = undefined;
    keycloakMock.updateToken.mockReset();
    keycloakMock.updateToken.mockResolvedValue(true);
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe("api clients", () => {
    it("creates clients with base URLs", async () => {
        vi.stubEnv("VITE_CATALOG_API_URL", CATALOG_API_URL);
        vi.stubEnv("VITE_MEDIA_API_URL", MEDIA_API_URL);
        vi.stubEnv("VITE_USER_API_URL", USER_API_URL);

        const {catalogClient, mediaClient, userClient} = await import("./client");

        expect(catalogClient.defaults.baseURL).toBe(CATALOG_API_URL);
        expect(mediaClient.defaults.baseURL).toBe(MEDIA_API_URL);
        expect(userClient.defaults.baseURL).toBe(USER_API_URL);
    });

    it("adds a correlation id to requests", async () => {
        const randomUUID = vi.fn(() => CORRELATION_ID);
        vi.stubGlobal("crypto", {randomUUID});
        vi.stubEnv("VITE_CATALOG_API_URL", CATALOG_API_URL);
        vi.stubEnv("VITE_MEDIA_API_URL", MEDIA_API_URL);
        vi.stubEnv("VITE_USER_API_URL", USER_API_URL);
        const {catalogClient, mediaClient, userClient, CORRELATION_ID_HEADER} = await import("./client");
        const captureConfigAdapter: AxiosAdapter = async (config) => ({
            config,
            data: null,
            headers: {},
            status: 200,
            statusText: "OK"
        });

        catalogClient.defaults.adapter = captureConfigAdapter;
        mediaClient.defaults.adapter = captureConfigAdapter;
        userClient.defaults.adapter = captureConfigAdapter;

        const apiResponse = await catalogClient.get("/films");
        const mediaResponse = await mediaClient.get("/media/files");
        const userResponse = await userClient.get("/users/me");

        expect(apiResponse.config.headers.get(CORRELATION_ID_HEADER)).toBe(CORRELATION_ID);
        expect(mediaResponse.config.headers.get(CORRELATION_ID_HEADER)).toBe(CORRELATION_ID);
        expect(userResponse.config.headers.get(CORRELATION_ID_HEADER)).toBe(CORRELATION_ID);
        expect(randomUUID).toHaveBeenCalledTimes(3);
    });

    it("adds an authorization header to authenticated requests", async () => {
        const randomUUID = vi.fn(() => CORRELATION_ID);
        vi.stubGlobal("crypto", {randomUUID});
        keycloakMock.authenticated = true;
        keycloakMock.token = ACCESS_TOKEN;
        const {catalogClient, mediaClient, userClient} = await import("./client");
        const captureConfigAdapter: AxiosAdapter = async (config) => ({
            config,
            data: null,
            headers: {},
            status: 200,
            statusText: "OK"
        });

        catalogClient.defaults.adapter = captureConfigAdapter;
        mediaClient.defaults.adapter = captureConfigAdapter;
        userClient.defaults.adapter = captureConfigAdapter;

        const apiResponse = await catalogClient.get("/films");
        const mediaResponse = await mediaClient.get("/media/files");
        const userResponse = await userClient.get("/users/me");

        expect(apiResponse.config.headers.get("Authorization")).toBe(`Bearer ${ACCESS_TOKEN}`);
        expect(mediaResponse.config.headers.get("Authorization")).toBe(`Bearer ${ACCESS_TOKEN}`);
        expect(userResponse.config.headers.get("Authorization")).toBe(`Bearer ${ACCESS_TOKEN}`);
        expect(keycloakMock.updateToken).toHaveBeenCalledTimes(3);
        expect(keycloakMock.updateToken).toHaveBeenNthCalledWith(1, 30);
        expect(keycloakMock.updateToken).toHaveBeenNthCalledWith(2, 30);
        expect(keycloakMock.updateToken).toHaveBeenNthCalledWith(3, 30);
    });

    it("normalizes existing request headers before setting a correlation id", async () => {
        const randomUUID = vi.fn(() => CORRELATION_ID);
        vi.stubGlobal("crypto", {randomUUID});
        const {addCorrelationIdInterceptor, CORRELATION_ID_HEADER} = await import("./client");
        const requestUse = vi.fn();
        const client = {
            interceptors: {
                request: {
                    use: requestUse
                }
            }
        } as unknown as AxiosInstance;

        addCorrelationIdInterceptor(client);

        const interceptor = requestUse.mock.calls[0][0] as (
            config: InternalAxiosRequestConfig
        ) => InternalAxiosRequestConfig;
        const config = interceptor({
            headers: {"Accept": "application/json"}
        } as unknown as InternalAxiosRequestConfig);

        expect(requestUse).toHaveBeenCalledOnce();
        expect(config.headers).toBeInstanceOf(AxiosHeaders);
        expect(config.headers.get("Accept")).toBe("application/json");
        expect(config.headers.get(CORRELATION_ID_HEADER)).toBe(CORRELATION_ID);
    });

    it("skips token refresh for unauthenticated requests", async () => {
        const {addAuthInterceptor} = await import("./client");
        const requestUse = vi.fn();
        const client = {interceptors: {request: {use: requestUse}}} as unknown as AxiosInstance;

        addAuthInterceptor(client);

        const interceptor = requestUse.mock.calls[0][0] as (config: InternalAxiosRequestConfig) =>
            Promise<InternalAxiosRequestConfig>;
        const initialConfig = {
            headers: new AxiosHeaders({"Accept": "application/json"})
        } as InternalAxiosRequestConfig;
        const config = await interceptor(initialConfig);

        expect(requestUse).toHaveBeenCalledOnce();
        expect(config).toBe(initialConfig);
        expect(keycloakMock.updateToken).not.toHaveBeenCalled();
        expect(config.headers.get("Accept")).toBe("application/json");
        expect(config.headers.get("Authorization")).toBeUndefined();
    });
});
