import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider, useSession } from "./SessionProvider";
import type { SessionUser } from "@/lib/auth";

const { sessionGet, logoutPost } = vi.hoisted(() => ({
  sessionGet: vi.fn(), logoutPost: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ sessionGet, logoutPost }));

const user: SessionUser = { id: "u1", email: "test@example.invalid", first_name: "Test", last_name: "User" };
const deferred = () => {
  let resolve!: (value: SessionUser) => void;
  const promise = new Promise<SessionUser>((done) => { resolve = done; });
  return { promise, resolve };
};

describe("session logout races", () => {
  let root: Root;
  let client: QueryClient;
  let session: ReturnType<typeof useSession>;
  const Probe = () => { session = useSession(); return null; };
  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    sessionGet.mockReset();
    logoutPost.mockReset().mockResolvedValue(undefined);
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    root = createRoot(document.createElement("div"));
  });
  afterEach(async () => {
    await act(async () => { root.unmount(); });
    client.clear();
    vi.unstubAllGlobals();
  });
  const mount = async () => {
    await act(async () => {
      root.render(<QueryClientProvider client={client}><SessionProvider><Probe /></SessionProvider></QueryClientProvider>);
    });
  };

  it("does not restore a user when an initial session query finishes after logout", async () => {
    const request = deferred();
    sessionGet.mockReturnValue(request.promise);
    await mount();
    await act(async () => { await session.logout(); });
    await act(async () => {
      request.resolve(user);
      await vi.waitFor(() => expect(client.getQueryState(["auth", "session"])?.fetchStatus).toBe("idle"));
    });
    expect(client.getQueryData(["auth", "session"])).toBeNull();
  });

  it("does not restore a user when a manual refresh finishes after logout", async () => {
    sessionGet.mockResolvedValueOnce(user);
    await mount();
    await act(async () => {
      await vi.waitFor(() => expect(client.getQueryData(["auth", "session"])).toEqual(user));
    });
    const request = deferred();
    sessionGet.mockReturnValueOnce(request.promise);
    const refresh = session.refreshSession();
    await act(async () => { await session.logout(); });
    await act(async () => { request.resolve(user); await refresh; });
    expect(client.getQueryData(["auth", "session"])).toBeNull();
  });

  it("invalidates a refresh started while the logout request is pending", async () => {
    sessionGet.mockResolvedValueOnce(user);
    await mount();
    await act(async () => {
      await vi.waitFor(() => expect(client.getQueryData(["auth", "session"])).toEqual(user));
    });
    const logoutRequest = deferred();
    logoutPost.mockReturnValueOnce(logoutRequest.promise);
    const loggingOut = session.logout();
    await act(async () => {
      await vi.waitFor(() => expect(logoutPost).toHaveBeenCalled());
    });
    const request = deferred();
    sessionGet.mockReturnValueOnce(request.promise);
    const refresh = session.refreshSession();
    await act(async () => { logoutRequest.resolve(user); await loggingOut; });
    await act(async () => { request.resolve(user); await refresh; });
    expect(client.getQueryData(["auth", "session"])).toBeNull();
  });
});
