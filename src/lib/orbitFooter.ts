export type OrbitFooterVariant = "full" | "compact" | "auth-compact" | "legal-only";

export type OrbitSocialNetwork =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "x"
  | "youtube"
  | "github"
  | "tiktok"
  | "threads";

export interface OrbitFooterLink {
  label?: string;
  resolvedLabel?: string;
  labelKey?: string;
  href: string;
}

export interface OrbitSocialLink {
  network: OrbitSocialNetwork;
  url: string;
  enabled: boolean;
  validated: boolean;
  label?: string;
}

export interface OrbitFooterResource {
  brand: string;
  revision: number;
  expectedVersion: number;
  attribution: "Powered by Codestra.co";
  links: OrbitFooterLink[];
  social: OrbitSocialLink[];
  published: boolean;
}

const socialNetworks = new Set<OrbitSocialNetwork>([
  "linkedin",
  "facebook",
  "instagram",
  "x",
  "youtube",
  "github",
  "tiktok",
  "threads",
]);

const correlationId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `orbit-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const safeHref = (raw: unknown): string | null => {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw, globalThis.location?.origin ?? "https://codestra.co");
    if (url.username || url.password) return null;
    const local = url.origin === (globalThis.location?.origin ?? "https://codestra.co");
    if (local) return `${url.pathname}${url.search}${url.hash}`;
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const validFooterLink = (value: unknown): value is OrbitFooterLink => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<OrbitFooterLink>;
  const label = item.label ?? item.resolvedLabel ?? item.labelKey;
  return typeof label === "string" && Boolean(label.trim()) && safeHref(item.href) !== null;
};

const validSocialLink = (value: unknown): value is OrbitSocialLink => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<OrbitSocialLink>;
  if (!item.network || !socialNetworks.has(item.network)) return false;
  if (item.enabled !== true || item.validated !== true) return false;
  if (typeof item.url !== "string") return false;
  try {
    const url = new URL(item.url);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
};

const parseFooter = (value: unknown): OrbitFooterResource => {
  if (!value || typeof value !== "object") throw new TypeError("Invalid footer resource");
  const resource = value as Partial<OrbitFooterResource>;
  if (
    resource.brand !== "codestra" ||
    !Number.isSafeInteger(resource.revision) ||
    !Number.isSafeInteger(resource.expectedVersion) ||
    resource.attribution !== "Powered by Codestra.co" ||
    typeof resource.published !== "boolean" ||
    !Array.isArray(resource.links) ||
    !Array.isArray(resource.social)
  ) {
    throw new TypeError("Invalid footer resource");
  }
  return {
    brand: resource.brand,
    revision: resource.revision as number,
    expectedVersion: resource.expectedVersion as number,
    attribution: "Powered by Codestra.co",
    published: resource.published,
    links: resource.links.filter(validFooterLink).map((item) => ({
      ...item,
      href: safeHref(item.href) as string,
    })),
    social: resource.published ? resource.social.filter(validSocialLink) : [],
  };
};

export const fetchOrbitFooter = async (
  brand = "codestra",
  signal?: AbortSignal,
): Promise<OrbitFooterResource> => {
  const response = await fetch(`/api/v1/brands/${encodeURIComponent(brand)}/footer`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "X-Correlation-ID": correlationId(),
    },
    signal,
  });
  if (!response.ok) throw new Error("Footer resource is unavailable");
  return parseFooter(await response.json());
};

export const orbitSocialNetworks = Object.freeze([...socialNetworks]);
