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

const appSource = requireFile("src/App.tsx");
const authSource = requireFile("src/lib/browserSession.ts");
const headerSource = requireFile("src/Components/Layouts/Navbar.tsx");
const footerSource = requireFile("src/Components/Layouts/Footer.tsx");
const orbitCss = requireFile("src/orbit.css");
const routeManifestText = requireFile("orbit/routes.json");
const adoptionManifestText = requireFile("orbit/adoption-manifest.json");

let routeManifest;
let adoptionManifest;
try {
  routeManifest = JSON.parse(routeManifestText);
} catch {
  failures.push("orbit/routes.json is not valid JSON");
}
try {
  adoptionManifest = JSON.parse(adoptionManifestText);
} catch {
  failures.push("orbit/adoption-manifest.json is not valid JSON");
}

const requiredTokens = [
  "--orbit-canvas: #000000",
  "--orbit-surface: #101010",
  "--orbit-surface-elevated: #171717",
  "--orbit-text-primary: #ffffff",
  "--orbit-text-secondary: #d8d8d8",
  "--orbit-text-muted: #9a9a9a",
  "--orbit-border: #353535",
  "--orbit-border-strong: #5a5a5a",
  "--orbit-control-height: 52px",
  "--orbit-touch-target: 44px",
  "--orbit-radius-maximum: 6px",
];

for (const token of requiredTokens) {
  if (!orbitCss.includes(token)) failures.push(`missing canonical token: ${token}`);
}

if (!headerSource.includes('data-orbit-component="header"')) {
  failures.push("shared header marker is missing");
}
if (!footerSource.includes('data-orbit-component="footer"')) {
  failures.push("shared footer marker is missing");
}
if (!footerSource.includes("Powered by Codestra.co")) {
  failures.push("exact corporate footer attribution is missing");
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

const tokenStoragePattern =
  /(?:localStorage|sessionStorage)\s*\.\s*(?:setItem|getItem)\s*\(\s*["'`][^"'`]*(?:access|refresh|identity|id[_-]?token|bearer|jwt)/i;
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (tokenStoragePattern.test(content)) {
    failures.push(`browser token storage is prohibited: ${path.relative(root, file)}`);
  }
}

if (!authSource.includes('const AUTH_BASE_PATH = "/auth"')) {
  failures.push("same-origin /auth boundary is missing");
}
const requiredAuthMarkers = [
  '/session',
  'authRedirect("login"',
  'authRedirect("signup"',
  '"/logout"',
  '"/logout-all"',
];
for (const marker of requiredAuthMarkers) {
  if (!authSource.includes(marker)) failures.push(`auth operation marker missing: ${marker}`);
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
      if (!["public", "optional", "required", "operator"].includes(route.auth)) {
        failures.push(`invalid auth class for ${route.path}`);
      }
      if (!route.shell || !route.footer) failures.push(`missing shell/footer for ${route.path}`);
      if (!Array.isArray(route.states) || !route.states.includes("loading") || !route.states.includes("error")) {
        failures.push(`route states incomplete for ${route.path}`);
      }
      if (route.auth === "required" && !route.states.includes("permission-denied")) {
        failures.push(`protected route needs permission-denied state: ${route.path}`);
      }
    }
    const renderedPaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);
    for (const routePath of renderedPaths) {
      if (!paths.has(routePath)) failures.push(`App route is not registered: ${routePath}`);
    }
  }
}

if (adoptionManifest) {
  if (adoptionManifest.repository !== "appolon1908-hue/codestra") {
    failures.push("adoption manifest repository mismatch");
  }
  if (adoptionManifest.targetBranch !== "codex/codestra-orbit-v2-codestra") {
    failures.push("adoption branch mismatch");
  }
  if (adoptionManifest.domain !== "codestra.co") failures.push("adoption domain mismatch");
}

const baseRef =
  process.env.ORBIT_BASE_REF ||
  (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : "HEAD^");

let diff = "";
try {
  diff = execFileSync(
    "git",
    ["diff", "--unified=0", `${baseRef}...HEAD`, "--", "src", "orbit"],
    { encoding: "utf8" },
  );
} catch {
  try {
    diff = execFileSync("git", ["diff", "--unified=0", "HEAD^", "HEAD", "--", "src", "orbit"], {
      encoding: "utf8",
    });
  } catch {
    diff = "";
  }
}

let activeFile = "";
let routeRegistryChanged = false;
let pageOrRouteChanged = false;
for (const line of diff.split("\n")) {
  if (line.startsWith("+++ b/")) {
    activeFile = line.slice(6);
    if (activeFile === "orbit/routes.json") routeRegistryChanged = true;
    if (activeFile.startsWith("src/Pages/") || ["src/App.tsx", "src/Routes/AllRoutes.tsx"].includes(activeFile)) {
      pageOrRouteChanged = true;
    }
    continue;
  }
  if (!line.startsWith("+") || line.startsWith("+++")) continue;
  if (!/\.(?:ts|tsx|js|jsx|css|scss)$/.test(activeFile)) continue;
  if (activeFile === "src/orbit.css") continue;

  const addition = line.slice(1);
  if (/#[0-9a-f]{3,8}\b/i.test(addition)) {
    failures.push(`new raw color outside token authority: ${activeFile}`);
  }
  if (/(?:linear|radial)-gradient\(|backdrop-(?:filter|blur)|\bglass(?:morphism)?\b/i.test(addition)) {
    failures.push(`prohibited visual effect added: ${activeFile}`);
  }
  if (/(?:rounded-(?:lg|xl|2xl|3xl|full)|border-radius\s*:\s*(?:[7-9]|[1-9]\d+)px)/i.test(addition)) {
    failures.push(`radius exceeds Orbit policy: ${activeFile}`);
  }
}

if (pageOrRouteChanged && !routeRegistryChanged) {
  failures.push("page or route changes must update orbit/routes.json in the same pull request");
}

if (failures.length) {
  console.error("CODESTRA_ORBIT_ADOPTION=FAIL");
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("CODESTRA_ORBIT_ADOPTION=PASS");
console.log(`REGISTERED_ROUTES=${routeManifest.routes.length}`);
console.log("CANONICAL_DOMAIN=codestra.co");
console.log("SHARED_HEADER=PASS");
console.log("SHARED_FOOTER=PASS");
console.log("LOGIN_LOGOUT_SESSION=PASS");
console.log("BROWSER_TOKEN_STORAGE=PROHIBITED");
console.log("NEW_PAGE_GATE=ENFORCED");
