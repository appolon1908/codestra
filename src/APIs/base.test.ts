import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosAdapter, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const refreshUrl = "/api/auth/refresh-session/";

const deferred = () => {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
};

describe("cookie session refresh recovery", () => {
  let client: AxiosInstance;
  let gate: ReturnType<typeof deferred>;
  let refreshSucceeds: boolean;
  let accessValid: boolean;
  let alwaysUnauthorized: boolean;
  let refreshRequests: number;
  let attempts: Record<string, number>;
  let expiredEvents: number;
  const onExpired = () => { expiredEvents += 1; };

  beforeEach(async () => {
    vi.resetModules();
    gate = deferred();
    refreshSucceeds = true;
    accessValid = false;
    alwaysUnauthorized = false;
    refreshRequests = 0;
    attempts = {};
    expiredEvents = 0;
    window.addEventListener("codestra-auth-expired", onExpired);

    const { default: axios, AxiosError } = await import("axios");
    const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
      const url = config.url ?? "";
      attempts[url] = (attempts[url] ?? 0) + 1;
      if (url === refreshUrl) {
        refreshRequests += 1;
        await gate.promise;
        if (refreshSucceeds) accessValid = true;
      }
      const authorized = url === refreshUrl
        ? refreshSucceeds
        : accessValid && !alwaysUnauthorized;
      const response = {
        data: authorized ? { resource: url } : { detail: "Session expired" },
        status: authorized ? 200 : 401,
        statusText: authorized ? "OK" : "Unauthorized",
        headers: {},
        config,
      };
      if (!authorized) {
        throw new AxiosError("Unauthorized", AxiosError.ERR_BAD_REQUEST, config, undefined, response);
      }
      return response;
    };
    axios.defaults.adapter = adapter;
    client = (await import("./base")).base_url;
  });

  afterEach(() => {
    gate.release();
    window.removeEventListener("codestra-auth-expired", onExpired);
    vi.resetModules();
  });

  it("recovers concurrent expired requests through one refresh and replays each once", async () => {
    const requests = Promise.all([client.get("/api/first/"), client.get("/api/second/")]);
    await vi.waitFor(() => expect(refreshRequests).toBeGreaterThan(0));
    gate.release();
    const responses = await requests;

    expect(responses.map((response) => response.data)).toEqual([
      { resource: "/api/first/" },
      { resource: "/api/second/" },
    ]);
    expect(refreshRequests).toBe(1);
    expect(attempts["/api/first/"]).toBe(2);
    expect(attempts["/api/second/"]).toBe(2);
    expect(expiredEvents).toBe(0);

    accessValid = false;
    await expect(client.get("/api/later/")).resolves.toMatchObject({ status: 200 });
    expect(refreshRequests).toBe(2);
    expect(attempts["/api/later/"]).toBe(2);
  });

  it("rejects all waiting requests after one failed refresh and permits a later recovery", async () => {
    refreshSucceeds = false;
    const requests = Promise.allSettled([client.get("/api/first/"), client.get("/api/second/")]);
    await vi.waitFor(() => expect(refreshRequests).toBeGreaterThan(0));
    gate.release();

    expect((await requests).map((result) => result.status)).toEqual(["rejected", "rejected"]);
    expect(refreshRequests).toBe(1);
    expect(attempts["/api/first/"]).toBe(1);
    expect(attempts["/api/second/"]).toBe(1);
    expect(expiredEvents).toBe(1);

    refreshSucceeds = true;
    const response = await client.get("/api/auth/session/");
    expect(response.data).toEqual({ resource: "/api/auth/session/" });
    expect(refreshRequests).toBe(2);
    expect(attempts["/api/auth/session/"]).toBe(2);
  });

  it("stops after one replay if the protected request still returns 401", async () => {
    alwaysUnauthorized = true;
    gate.release();
    await expect(client.get("/api/denied/")).rejects.toMatchObject({ response: { status: 401 } });
    expect(refreshRequests).toBe(1);
    expect(attempts["/api/denied/"]).toBe(2);
  });

  it.each(["/api/auth/login/", "/api/auth/logout/", refreshUrl])(
    "does not refresh authentication failures from %s",
    async (url) => {
      refreshSucceeds = false;
      gate.release();
      await expect(client.post(url, {})).rejects.toMatchObject({ response: { status: 401 } });
      expect(refreshRequests).toBe(url === refreshUrl ? 1 : 0);
      expect(attempts[url]).toBe(1);
    },
  );
});
