import { describe, expect, it, vi } from "vitest";
import {
  AuthRequestError,
  beginLogin,
  getBrowserSession,
  safeReturnPath,
} from "./browserSession";

describe("Codestra browser-session controls", () => {
  it("keeps return paths on the current origin", () => {
    const origin = "https://codestra.co";
    expect(safeReturnPath("/auth/dashboard?tab=security", origin)).toBe(
      "/auth/dashboard?tab=security",
    );
    expect(safeReturnPath("https://evil.example/steal", origin)).toBe(
      "/auth/dashboard",
    );
    expect(safeReturnPath("//evil.example/steal", origin)).toBe(
      "/auth/dashboard",
    );
  });

  it("starts login with an encoded, same-origin deep link", () => {
    const assign = vi.fn();
    const locationRef = {
      origin: "https://codestra.co",
      pathname: "/auth/dashboard",
      search: "?tab=security",
      hash: "#sessions",
      assign,
    };

    const target = beginLogin(undefined, locationRef);

    expect(target).toBe(
      "/auth/login?return_to=%2Fauth%2Fdashboard%3Ftab%3Dsecurity%23sessions",
    );
    expect(assign).toHaveBeenCalledWith(target);
  });

  it("treats an unauthorized session response as anonymous", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(getBrowserSession({ fetchImpl })).resolves.toEqual({
      authenticated: false,
      roles: [],
      capabilities: [],
    });
  });

  it("normalizes an authenticated session without exposing tokens", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json({
        authenticated: true,
        expiresAt: "2026-09-03T00:00:00Z",
        user: {
          id: "user-1",
          displayName: "Codestra User",
          email: "user@example.com",
        },
        roles: ["customer"],
        capabilities: ["account:read"],
      }),
    );

    const session = await getBrowserSession({ fetchImpl });

    expect(session.authenticated).toBe(true);
    expect(session.user?.displayName).toBe("Codestra User");
    expect(JSON.stringify(session)).not.toMatch(/access_token|refresh_token|id_token/i);
  });

  it("returns a generic account error with a correlation identifier", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 503,
        headers: { "X-Correlation-ID": "correlation-1" },
      }),
    );

    await expect(getBrowserSession({ fetchImpl })).rejects.toMatchObject({
      name: "AuthRequestError",
      status: 503,
      correlationId: "correlation-1",
    } satisfies Partial<AuthRequestError>);
  });
});
