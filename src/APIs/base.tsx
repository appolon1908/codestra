import axios, { type InternalAxiosRequestConfig } from "axios";
import { REFRESH_SESSION_ENDPOINT } from "./endpoints";

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

base_url.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableConfig | undefined;
    const url = config?.url ?? "";
    const canRefresh =
      error.response?.status === 401 &&
      config &&
      !config._codestraRetry &&
      !url.includes("/api/auth/login/") &&
      !url.includes(REFRESH_SESSION_ENDPOINT);

    if (canRefresh) {
      config._codestraRetry = true;
      try {
        await refresh_client.post(REFRESH_SESSION_ENDPOINT, {});
        return base_url(config);
      } catch {
        window.dispatchEvent(new Event("codestra-auth-expired"));
      }
    }

    return Promise.reject(error);
  },
);
