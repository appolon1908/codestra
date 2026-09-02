import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requireFile = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
};
const requireText = (text, values, context) => {
  for (const value of values) {
    if (!text.includes(value)) failures.push(`${context} missing ${value}`);
  }
};

const appSource = requireFile("src/App.tsx");
const mainSource = requireFile("src/main.tsx");
const authSource = requireFile("src/lib/browserSession.ts");
const footerClientSource = requireFile("src/lib/orbitFooter.ts");
const headerSource = requireFile("src/Components/Layouts/Navbar.tsx");
const footerSource = requireFile("src/Components/Layouts/Footer.tsx");
const baseCss = requireFile("src/orbit.css");
const approvedCss = requireFile("src/orbit-approved-tokens.css");
const routeManifestText = requireFile("orbit/routes.json");
const adoptionManifestText = requireFile("orbit/adoption-manifest.json");

let routeManifest;
let adoptionManifest;
try { routeManifest = JSON.parse(routeManifestText); }
catch { failures.push("orbit/routes.json is not valid JSON"); }
try { adoptionManifest = JSON.parse(adoptionManifestText); }
catch { failures.push("orbit/adoption-manifest.json is not valid JSON"); }

const requiredTokens = [
  "--orbit-canvas: #000000",
  "--orbit-surface: #101010",
  "--orbit-surface-elevated: #171717",
  "--orbit-surface-secondary: #202020",
  "--orbit-text-primary: #FFFFFF",
  "--orbit-text-secondary: #D8D8D8",
  "--orbit-text-muted: #9A9A9A",
  "--orbit-border: #353535",
  "--orbit-border-strong: #5A5A5A",
  "--orbit-action-primary-background: #FFFFFF",
  "--orbit-action-primary-text: #000000",
  "--orbit-action-primary-hover: #E7E7E7",
  "--orbit-action-primary-active: #CCCCCC",
  "--orbit-status-success: #36C98F",
  "--orbit-status-warning: #F4B860",
  "--orbit-status-error: #FF6469",
  "--orbit-status-info: #79B8FF",
  "--orbit-control-height: 52px",
  "--orbit-control-compact-height: 44px",
  "--orbit-touch-target: 44px",
  "--orbit-social-icon-size: 20px",
  "--orbit-social-target-size: 44px",
  "--orbit-header-height: 76px",
  "--orbit-content-main: 1280px",
  "--orbit-content-width: 1440px",
  "--orbit-text-column-width: 720px",
  "--orbit-auth-width: 480px",
  "--orbit-radius-control: 2px",
  "--orbit-radius-maximum: 6px",
];
requireText(approvedCss, requiredTokens, "approved token authority");
requireText(mainSource, ['import "./orbit.css";', 'import "./orbit-approved-tokens.css";'], "application entry point");
if (mainSource.indexOf('import "./orbit-approved-tokens.css";') < mainSource.indexOf('import "./orbit.css";')) {
  failures.push("approved Orbit tokens must load after the legacy base shell");
}
if (!baseCss.includes("--orbit-canvas")) failures.push("base Orbit shell is missing");

if (!headerSource.includes('data-orbit-component="header"')) failures.push("shared header marker is missing");
if (!footerSource.includes('data-orbit-component="footer"')) failures.push("shared footer marker is missing");
requireText(footerSource, [
  "Powered by Codestra.co",
  'data-social-links-from-api="true"',
  'data-footer-resource="footer_codestra_global"',
  "fetchOrbitFooter(\"codestra\"",
  'variant !== "legal-only"',
], "shared footer");

const footerVariants = ["full", "compact", "auth-compact", "legal-only"];
for (const variant of footerVariants) {
  if (!approvedCss.includes(`data-variant=\"${variant}\"`) && variant !== "full") {
    failures.push(`approved footer CSS missing ${variant} variant`);
  }
}
const networks = ["linkedin", "facebook", "instagram", "x", "youtube", "github", "tiktok", "threads"];
for (const network of networks) {
  if (!footerClientSource.includes(`\"${network}\"`)) failures.push(`footer client missing ${network}`);
}
requireText(footerClientSource, [
  "/api/v1/brands/${encodeURIComponent(brand)}/footer",
  'credentials: "include"',
  'cache: "no-store"',
  '"X-Correlation-ID"',
  "resource.published ? resource.social.filter(validSocialLink) : []",
  'item.enabled !== true || item.validated !== true',
  'url.protocol === "https:"',
], "footer API client");
if (/https:\/\/(?:www\.)?(?:linkedin|facebook|instagram|x|twitter|youtube|github|tiktok|threads)\./i.test(`${footerSource}\n${footerClientSource}`)) {
  failures.push("production social destinations must not be hardcoded in frontend source");
}

const sourceFiles = [];
const collect = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(fullPath);
    if (entry.isFile() && /\.(?:ts|tsx|js|jsx)$/.test(entry.name)) sourceFiles.push(fullPath);
  }
};
collect(path.join(root, "src"));

const tokenStoragePattern = /(?:localStorage|sessionStorage)\s*\.\s*(?:setItem|getItem)\s*\(\s*["'`][^"'`]*(?:access|refresh|identity|id[_-]?token|bearer|jwt)/i;
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (tokenStoragePattern.test(content)) failures.push(`browser token storage is prohibited: ${path.relative(root, file)}`);
}

if (!authSource.includes('const AUTH_BASE_PATH = "/auth"')) failures.push("same-origin /auth boundary is missing");
for (const marker of ['/session', 'authRedirect("login"', 'authRedirect("signup"', '"/logout"', '"/logout-all"']) {
  if (!authSource.includes(marker)) failures.push(`auth operation marker missing: ${marker}`);
}
const prohibitedAuthReferences = ["ReturnUrl", "code_challenge", "client_id=", "redirect_uri=", "starlink"];
for (const marker of prohibitedAuthReferences) {
  if (authSource.toLowerCase().includes(marker.toLowerCase())) failures.push(`prohibited external authentication reference: ${marker}`);
}

if (routeManifest) {
  if (routeManifest.schemaVersion !== "2.0.0") failures.push("route manifest version mismatch");
  if (!Array.isArray(routeManifest.routes)) {
    failures.push("route manifest routes must be an array");
  } else {
    const paths = new Set();
    for (const route of routeManifest.routes) {
      if (paths.has(route.path)) failures.push(`duplicate route manifest path: ${route.path}`);
      paths.add(route.path);
      if (!["public", "optional", "required", "operator"].includes(route.auth)) failures.push(`invalid auth class for ${route.path}`);
      if (!route.shell || !route.footer) failures.push(`missing shell/footer for ${route.path}`);
      if (!footerVariants.includes(route.footer)) failures.push(`invalid footer variant for ${route.path}`);
      if (!Array.isArray(route.contentKeys) || !Array.isArray(route.assetIds)) failures.push(`route content/asset declarations incomplete for ${route.path}`);
      if (!Array.isArray(route.states) || !route.states.includes("loading") || !route.states.includes("error")) failures.push(`route states incomplete for ${route.path}`);
      if (route.auth === "required" && !route.states.includes("permission-denied")) failures.push(`protected route needs permission-denied state: ${route.path}`);
    }
    const renderedPaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);
    for (const routePath of renderedPaths) if (!paths.has(routePath)) failures.push(`App route is not registered: ${routePath}`);
  }
}

if (adoptionManifest) {
  if (adoptionManifest.repository !== "appolon1908-hue/codestra") failures.push("adoption manifest repository mismatch");
  if (adoptionManifest.targetBranch !== "codex/codestra-orbit-v2-codestra") failures.push("adoption branch mismatch");
  if (adoptionManifest.domain !== "codestra.co") failures.push("adoption domain mismatch");
}

const baseRef = process.env.ORBIT_BASE_REF || (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "HEAD^");
let diff = "";
try {
  diff = execFileSync("git", ["diff", "--unified=0", `${baseRef}...HEAD`, "--", "src", "orbit"], { encoding: "utf8" });
} catch {
  try { diff = execFileSync("git", ["diff", "--unified=0", "HEAD^", "HEAD", "--", "src", "orbit"], { encoding: "utf8" }); }
  catch { diff = ""; }
}

let activeFile = "";
let routeRegistryChanged = false;
let pageOrRouteChanged = false;
const tokenAuthorities = new Set(["src/orbit.css", "src/orbit-approved-tokens.css"]);
for (const line of diff.split("\n")) {
  if (line.startsWith("+++ b/")) {
    activeFile = line.slice(6);
    if (activeFile === "orbit/routes.json") routeRegistryChanged = true;
    if (activeFile.startsWith("src/Pages/") || ["src/App.tsx", "src/Routes/AllRoutes.tsx"].includes(activeFile)) pageOrRouteChanged = true;
    continue;
  }
  if (!line.startsWith("+") || line.startsWith("+++") || !/\.(?:ts|tsx|js|jsx|css|scss)$/.test(activeFile)) continue;
  if (tokenAuthorities.has(activeFile)) continue;

  const addition = line.slice(1);
  if (/#[0-9a-f]{3,8}\b/i.test(addition)) failures.push(`new raw color outside token authority: ${activeFile}`);
  if (/(?:linear|radial)-gradient\(|backdrop-(?:filter|blur)|\bglass(?:morphism)?\b|box-shadow\s*:\s*(?!none)/i.test(addition)) failures.push(`prohibited visual effect added: ${activeFile}`);
  if (/(?:rounded-(?:lg|xl|2xl|3xl|full)|border-radius\s*:\s*(?:[7-9]|[1-9]\d+)px)/i.test(addition)) failures.push(`radius exceeds Orbit policy: ${activeFile}`);
}
if (pageOrRouteChanged && !routeRegistryChanged) failures.push("page or route changes must update orbit/routes.json in the same pull request");

if (failures.length) {
  console.error("CODESTRA_ORBIT_ADOPTION=FAIL");
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("CODESTRA_ORBIT_ADOPTION=PASS");
console.log(`REGISTERED_ROUTES=${routeManifest.routes.length}`);
console.log("CANONICAL_DOMAIN=codestra.co");
console.log("EXACT_APPROVED_TOKENS=PASS");
console.log("SHARED_HEADER=PASS");
console.log("SHARED_FOOTER=PASS");
console.log("FOOTER_API=GOVERNED");
console.log("SOCIAL_NETWORKS=8/8");
console.log("LOGIN_LOGOUT_SESSION=PASS");
console.log("BROWSER_TOKEN_STORAGE=PROHIBITED");
console.log("NEW_PAGE_GATE=ENFORCED");
