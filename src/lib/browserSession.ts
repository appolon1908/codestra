export type SessionUser = {
  id: string;
  displayName: string;
  email?: string;
};

export type BrowserSession = {
  authenticated: boolean;
  expiresAt?: string;
  user?: SessionUser;
  tenant?: {
    id: string;
    name?: string;
  };
  roles: string[];
  capabilities: string[];
  csrfToken?: string;
};

export type AuthEvent = {
  type: "signed-out" | "signed-out-all" | "session-refreshed";
  at: string;
  nonce: string;
};

type LocationTarget = Pick<Location, "origin" | "pathname" | "search" | "hash"> & {
  assign: (url: string) => void;
};

type AuthClientOptions = {
  fetchImpl?: typeof fetch;
  locationRef?: LocationTarget;
  signal?: AbortSignal;
};

const AUTH_BASE_PATH = "/auth";
const AUTH_EVENT_CHANNEL = "codestra:auth";
const AUTH_EVENT_STORAGE_KEY = "codestra:auth:event";
const DEFAULT_RETURN_PATH = "/auth/dashboard";

let activeCsrfToken = "";

const createCorrelationId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `codestra-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const currentLocation = (): LocationTarget => window.location;

const normalizeSession = (value: unknown): BrowserSession => {
  if (!value || typeof value !== "object") {
    return { authenticated: false, roles: [], capabilities: [] };
  }

  const record = value as Record<string, unknown>;
  if (record.authenticated !== true) {
    return { authenticated: false, roles: [], capabilities: [] };
  }

  const rawUser =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : undefined;
  const rawTenant =
    record.tenant && typeof record.tenant === "object"
      ? (record.tenant as Record<string, unknown>)
      : undefined;

  const userId = typeof rawUser?.id === "string" ? rawUser.id : "";
  const displayName =
    typeof rawUser?.displayName === "string"
      ? rawUser.displayName
      : typeof rawUser?.display_name === "string"
        ? rawUser.display_name
        : typeof rawUser?.email === "string"
          ? rawUser.email
          : "Account";

  const session: BrowserSession = {
    authenticated: true,
    expiresAt:
      typeof record.expiresAt === "string"
        ? record.expiresAt
        : typeof record.expires_at === "string"
          ? record.expires_at
          : undefined,
    user: userId
      ? {
          id: userId,
          displayName,
          email: typeof rawUser?.email === "string" ? rawUser.email : undefined,
        }
      : undefined,
    tenant:
      typeof rawTenant?.id === "string"
        ? {
            id: rawTenant.id,
            name: typeof rawTenant.name === "string" ? rawTenant.name : undefined,
          }
        : undefined,
    roles: Array.isArray(record.roles)
      ? record.roles.filter((role): role is string => typeof role === "string")
      : [],
    capabilities: Array.isArray(record.capabilities)
      ? record.capabilities.filter(
          (capability): capability is string => typeof capability === "string",
        )
      : [],
    csrfToken:
      typeof record.csrfToken === "string"
        ? record.csrfToken
        : typeof record.csrf_token === "string"
          ? record.csrf_token
          : undefined,
  };

  activeCsrfToken = session.csrfToken ?? "";
  return session;
};

export const safeReturnPath = (
  value: string | null | undefined,
  origin = window.location.origin,
  fallback = DEFAULT_RETURN_PATH,
) => {
  let currentOrigin: URL;
  try {
    currentOrigin = new URL(origin);
  } catch {
    return fallback;
  }

  let candidate: URL;
  try {
    candidate = new URL(value || fallback, currentOrigin);
  } catch {
    return fallback;
  }

  if (
    candidate.origin !== currentOrigin.origin ||
    candidate.username ||
    candidate.password
  ) {
    return fallback;
  }

  return `${candidate.pathname}${candidate.search}${candidate.hash}`;
};

const returnPathFromLocation = (locationRef: LocationTarget) =>
  safeReturnPath(
    `${locationRef.pathname}${locationRef.search}${locationRef.hash}`,
    locationRef.origin,
  );

const authRedirect = (
  action: "login" | "signup",
  returnTo: string | null | undefined,
  locationRef = currentLocation(),
) => {
  const safe = safeReturnPath(returnTo, locationRef.origin);
  const target = `${AUTH_BASE_PATH}/${action}?return_to=${encodeURIComponent(safe)}`;
  locationRef.assign(target);
  return target;
};

export const beginLogin = (
  returnTo?: string | null,
  locationRef = currentLocation(),
) => authRedirect("login", returnTo ?? returnPathFromLocation(locationRef), locationRef);

export const beginSignup = (
  returnTo?: string | null,
  locationRef = currentLocation(),
) => authRedirect("signup", returnTo ?? returnPathFromLocation(locationRef), locationRef);

export class AuthRequestError extends Error {
  readonly status: number;
  readonly correlationId: string;

  constructor(status: number, correlationId: string) {
    super("The account request could not be completed.");
    this.name = "AuthRequestError";
    this.status = status;
    this.correlationId = correlationId;
  }
}

const request = async (
  path: string,
  init: RequestInit,
  { fetchImpl = fetch, signal }: AuthClientOptions = {},
) => {
  const correlationId = createCorrelationId();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Correlation-ID", correlationId);
  if (activeCsrfToken && init.method && !["GET", "HEAD"].includes(init.method)) {
    headers.set("X-CSRF-Token", activeCsrfToken);
  }

  let response: Response;
  try {
    response = await fetchImpl(`${AUTH_BASE_PATH}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
      redirect: "manual",
      signal,
    });
  } catch {
    throw new AuthRequestError(0, correlationId);
  }

  if (!response.ok) {
    throw new AuthRequestError(
      response.status,
      response.headers.get("x-correlation-id") ?? correlationId,
    );
  }

  return response;
};

export const getBrowserSession = async (options: AuthClientOptions = {}) => {
  const correlationId = createCorrelationId();
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    response = await fetchImpl(`${AUTH_BASE_PATH}/session`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Correlation-ID": correlationId,
      },
      credentials: "include",
      cache: "no-store",
      redirect: "manual",
      signal: options.signal,
    });
  } catch {
    throw new AuthRequestError(0, correlationId);
  }

  if (response.status === 401) {
    activeCsrfToken = "";
    return { authenticated: false, roles: [], capabilities: [] } satisfies BrowserSession;
  }

  if (!response.ok) {
    throw new AuthRequestError(
      response.status,
      response.headers.get("x-correlation-id") ?? correlationId,
    );
  }

  try {
    return normalizeSession(await response.json());
  } catch {
    throw new AuthRequestError(
      502,
      response.headers.get("x-correlation-id") ?? correlationId,
    );
  }
};

const publishAuthEvent = (event: AuthEvent) => {
  if (typeof BroadcastChannel === "function") {
    const channel = new BroadcastChannel(AUTH_EVENT_CHANNEL);
    channel.postMessage(event);
    channel.close();
  }

  try {
    localStorage.setItem(AUTH_EVENT_STORAGE_KEY, JSON.stringify(event));
    localStorage.removeItem(AUTH_EVENT_STORAGE_KEY);
  } catch {
    // BroadcastChannel and same-tab navigation remain available.
  }
};

export const subscribeToAuthEvents = (listener: (event: AuthEvent) => void) => {
  const channel =
    typeof BroadcastChannel === "function"
      ? new BroadcastChannel(AUTH_EVENT_CHANNEL)
      : null;
  const onMessage = (message: MessageEvent<AuthEvent>) => listener(message.data);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_EVENT_STORAGE_KEY || !event.newValue) return;
    try {
      listener(JSON.parse(event.newValue) as AuthEvent);
    } catch {
      // Ignore malformed, non-sensitive cross-tab events.
    }
  };

  channel?.addEventListener("message", onMessage);
  globalThis.addEventListener?.("storage", onStorage);

  return () => {
    channel?.removeEventListener("message", onMessage);
    channel?.close();
    globalThis.removeEventListener?.("storage", onStorage);
  };
};

const finishLogout = (
  type: AuthEvent["type"],
  returnTo: string,
  locationRef: LocationTarget,
) => {
  activeCsrfToken = "";
  publishAuthEvent({
    type,
    at: new Date().toISOString(),
    nonce: createCorrelationId(),
  });
  const target = safeReturnPath(returnTo, locationRef.origin, "/signed-out");
  locationRef.assign(target);
  return target;
};

export const logout = async (
  returnTo = "/signed-out",
  { locationRef = currentLocation(), ...options }: AuthClientOptions = {},
) => {
  await request("/logout", { method: "POST" }, options);
  return finishLogout("signed-out", returnTo, locationRef);
};

export const logoutAll = async (
  returnTo = "/signed-out",
  { locationRef = currentLocation(), ...options }: AuthClientOptions = {},
) => {
  await request("/logout-all", { method: "POST" }, options);
  return finishLogout("signed-out-all", returnTo, locationRef);
};
