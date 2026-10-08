import axios, { type InternalAxiosRequestConfig } from "axios";
import { LOGIN_ENDPOINT, LOGOUT_ENDPOINT, REFRESH_SESSION_ENDPOINT, SESSION_ENDPOINT } from "./endpoints";

type RetryableConfig = InternalAxiosRequestConfig & { _codestraRetry?: boolean };

const clientOptions = {
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  timeout: 35000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
};

export const base_url = axios.create(clientOptions);
const refresh_client = axios.create(clientOptions);
let refreshPromise: Promise<void> | null = null;

const refreshSession = () => {
  if (!refreshPromise) {
    // Rotating cookies must be refreshed once for all requests waiting on expiry.
    refreshPromise = refresh_client.post(REFRESH_SESSION_ENDPOINT, {})
      .then(() => undefined)
      .catch((error) => {
        window.dispatchEvent(new Event("codestra-auth-expired"));
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

base_url.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined;
    const url = config?.url ?? "";
    const canRefresh =
      error.response?.status === 401 &&
      config &&
      !config._codestraRetry &&
      ![LOGIN_ENDPOINT, LOGOUT_ENDPOINT, REFRESH_SESSION_ENDPOINT, SESSION_ENDPOINT]
        .some((endpoint) => url.includes(endpoint));

    if (canRefresh) {
      config._codestraRetry = true;
      try {
        await refreshSession();
      } catch {
        return Promise.reject(error);
      }
      return base_url(config);
    }

    return Promise.reject(error);
  },
);
