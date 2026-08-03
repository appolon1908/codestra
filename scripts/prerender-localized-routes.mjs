import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { coreRoutes, industries, locales, utilityRoutes, localizedPath, industryEntry } from "./seo-manifest.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "..", "dist");
const base = "https://codestra.co";
const socialImage = `${base}/og/codestra-default.svg`;
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const all = [...coreRoutes, ...industries.map((slug) => industryEntry(slug, "en"))];

function page(route, locale) {
  const title = route.titles[locale] ?? route.titles.en;
  const description = route.descriptions[locale] ?? route.descriptions.en;
  const heading = route.heading[locale] ?? route.heading.en;
  const path = localizedPath(locale, route.path);
  const alternatives = locales.map((alt) => `<link rel="alternate" hreflang="${alt}" href="${base}${localizedPath(alt, route.path)}" />`).join("") + `<link rel="alternate" hreflang="x-default" href="${base}${localizedPath("en", route.path)}" />`;
  const data = { "@context": "https://schema.org", "@type": route.path === "" ? "Organization" : "WebPage", name: title, description, url: `${base}${path}` };
  return `<!doctype html><html lang="${locale}" data-theme="black"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${escape(title)}</title><meta name="description" content="${escape(description)}"/><link rel="canonical" href="${base}${path}"/>${alternatives}<meta property="og:type" content="website"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${base}${path}"/><meta property="og:locale" content="${locale}"/><meta property="og:image" content="${socialImage}"/><meta property="og:image:alt" content="Codestra software and AI platform"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escape(title)}"/><meta name="twitter:description" content="${escape(description)}"/><meta name="twitter:image" content="${socialImage}"/><script type="application/ld+json">${JSON.stringify(data)}</script></head><body><div id="root"><main><header><a href="${localizedPath(locale, "")}">Codestra</a></header><article><p>Codestra</p><h1>${escape(heading)}</h1><p>${escape(description)}</p><p><a href="${localizedPath(locale, "contact")}">${locale === "es" ? "Iniciar un proyecto" : locale === "fr" ? "Démarrer un projet" : "Start a project"}</a> <a href="${localizedPath(locale, "services")}">${locale === "es" ? "Explorar soluciones" : locale === "fr" ? "Explorer les solutions" : "Explore solutions"}</a></p></article></main></div><script type="module" src="/src/main.tsx"></script></body></html>`;
}

const template = existsSync(join(dist, "index.html")) ? readFileSync(join(dist, "index.html"), "utf8") : "";
for (const locale of locales) for (const route of all) {
  const output = page(route, locale).replace('<script type="module" src="/src/main.tsx"></script>', template.match(/<script type="module"[^>]+><\/script>/)?.[0] ?? '<script type="module" src="/assets/index.js"></script>');
  const target = join(dist, locale, route.path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, output);
}
for (const locale of locales) for (const path of utilityRoutes) {
  const target = join(dist, locale, path, "index.html");
  mkdirSync(dirname(target), { recursive: true });
  const title = path === "thank-you" ? "Thank you | Codestra" : "Codestra";
  writeFileSync(target, `<!doctype html><html lang="${locale}"><head><meta charset="UTF-8"><meta name="robots" content="noindex,follow"><title>${title}</title></head><body><div id="root"></div>${template.match(/<script type="module"[^>]+><\/script>/)?.[0] ?? ""}</body></html>`);
}
writeFileSync(join(dist, "index.html"), '<!doctype html><html lang="en"><head><meta http-equiv="refresh" content="0;url=/en/"><meta name="robots" content="noindex"><title>Redirecting to Codestra</title></head><body></body></html>');
console.log(`Prerendered ${all.length * locales.length} indexable localized routes.`);
