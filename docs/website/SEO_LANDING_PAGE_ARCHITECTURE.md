# SEO landing-page architecture

## Scope

- 30 service pages under `/ai-services/<slug>`.
- 25 industry pages under `/industries/<slug>`.
- Crawlable index pages at `/ai-services` and `/industries`.
- Unique titles, descriptions, canonical URLs, headings, copy, FAQs and related links.

## Source of truth

`src/content/service-specs.json` and `src/content/industry-specs.json` hold the page-specific operating context. A shared deterministic builder produces the React content and build-time crawlable documents, while validation checks the complete catalog. This prevents the crawler-facing HTML and interactive page from drifting into separate content systems.

## Build behavior

`npm run build` now performs five gates:

1. validate page counts, slugs, uniqueness and section completeness;
2. check the source for known performance and metadata regressions;
3. run strict TypeScript and the Vite production build;
4. generate nested route documents and `sitemap.xml`;
5. verify every route document, canonical URL, static fallback and asset budget.

Each nested route document keeps Vite's fingerprinted assets but includes meaningful semantic content before JavaScript runs. FAQ and service/page information uses schema.org microdata, avoiding an inline-script exception in the content-security policy.

## Editorial rule

These pages are not city or keyword doorway pages. Each page describes a distinct capability or industry workflow, includes implementation constraints, and links to the most relevant adjacent pages. Future pages must pass the same uniqueness and completeness checks.
