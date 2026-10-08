import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/APIs/base", () => ({
  base_url: { get, post },
}));

import { logoutPost, sessionGet } from "./auth";

describe("cookie session API", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("loads the current user from the server session", async () => {
    get.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "user@example.invalid",
          first_name: "Test",
          last_name: "User",
        },
      },
    });

    await expect(sessionGet()).resolves.toMatchObject({
      id: "u1",
      email: "user@example.invalid",
    });
    expect(get).toHaveBeenCalledWith("/api/auth/session/");
  });

  it("returns null when no browser session exists", async () => {
    get.mockResolvedValue({ data: { user: null } });
    await expect(sessionGet()).resolves.toBeNull();
    expect(get).toHaveBeenCalledWith("/api/auth/session/");
  });

  it("logs out through the server cookie session", async () => {
    post.mockResolvedValue({ status: 205 });
    await logoutPost();
    expect(post).toHaveBeenCalledWith("/api/auth/logout/", {});
  });
});
