import { writeFileSync } from "node:fs";

const base = "https://codestra.co";
const locales = ["en", "es", "fr"];
const core = ["", "industries", "ai-receptionist", "book-demo", "request-pricing", "contact", "thank-you", "security", "privacy", "terms", "pricing"];
const industries = ["logistics-ai","legal-ai","healthcare-ai","senior-care-ai","real-estate-ai","financial-services-ai","ecommerce-ai","hospitality-ai","construction-ai","agriculture-ai","education-ai","dental-ai","veterinary-ai","automotive-ai","restaurant-ai","manufacturing-ai","recruitment-ai","nonprofit-ai","public-services-ai","energy-ai","telecom-it-ai","wellness-ai","security-services-ai","marketing-media-ai","gaming-entertainment-ai"];
const paths = [...core, ...industries.map((slug) => `industries/${slug}`)];
const escape = (value) => value.replaceAll("&", "&amp;");
const urls = paths.flatMap((path) => locales.map((locale) => {
  const localized = `${base}/${locale}/${path}`.replace(/\/$/, path ? "" : "/");
  const alternatives = locales.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escape(`${base}/${alternate}/${path}`.replace(/\/$/, path ? "" : "/"))}"/>`).join("");
  const defaultUrl = `${base}/en/${path}`.replace(/\/$/, path ? "" : "/");
  return `<url><loc>${escape(localized)}</loc>${alternatives}<xhtml:link rel="alternate" hreflang="x-default" href="${escape(defaultUrl)}"/></url>`;
}));
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>\n`);
console.log(`Generated ${urls.length} localized sitemap URLs.`);
