import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: "filmoteka",
    clientId: "filmoteka-ui",
});

let initialization: Promise<boolean> | undefined;

export function initializeKeycloak(): Promise<boolean> {
    initialization ??= keycloak.init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        silentCheckSsoRedirectUri: `${globalThis.location.origin}/silent-check-sso.html`,
        silentCheckSsoFallback: false,
    });

    return initialization;
}
