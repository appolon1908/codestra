const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_EVENT = "codestra:auth-change";

export type JwtPayload = {
  exp?: number;
  sub?: string;
  iss?: string;
};

const decodePayload = (token: string): JwtPayload | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
};

const publishAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

export const getAccessToken = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  publishAuthChange();
};

export const clearAccessToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    publishAuthChange();
  }
};

export const hasUsableAccessToken = () => {
  const token = getAccessToken();
  if (!token) return false;

  const payload = decodePayload(token);
  if (!payload) {
    clearAccessToken();
    return false;
  }
  if (typeof payload.exp !== "number") return true;
  if (payload.exp * 1000 > Date.now()) return true;

  clearAccessToken();
  return false;
};

export const subscribeToAuthChanges = (listener: () => void) => {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUTH_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
};

/**
 * Attempts the configured API logout operation before clearing the legacy
 * browser token. The path remains configurable until the Codestra backend
 * publishes its canonical logout contract.
 */
export const logoutSession = async () => {
  const endpoint = import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT as string | undefined;
  const apiOrigin = import.meta.env.VITE_API_ENDPOINT as string | undefined;
  const token = getAccessToken();

  try {
    if (endpoint && apiOrigin) {
      const target = new URL(endpoint, apiOrigin.endsWith("/") ? apiOrigin : `${apiOrigin}/`);
      await fetch(target, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });
    }
  } catch {
    // Local logout must still complete when the revocation endpoint is unavailable.
  } finally {
    clearAccessToken();
  }
};

export const authContract = Object.freeze({
  mode: "legacy-api-session",
  migrationTarget: "oidc-pkce",
  issuer: "https://auth.codestra.co/realms/codestra",
  durableIdentity: "issuer+subject",
});
