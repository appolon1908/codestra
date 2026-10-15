# Codestra website architecture

## Goals

The public website is designed as a fast, accessible marketing application with crawlable route output. The React experience and the static search-engine fallback are generated from the same content records.

## Branch sequence

1. `feat/website-modern-shell`
   - responsive header and footer
   - new homepage and design system
   - reusable service/industry templates
   - metadata and structured-data component
   - static route, sitemap, SEO and performance tooling
   - optional feature-route registry
2. `feat/ai-seo-landing-pages`
   - 30 AI/development/automation service pages
   - 25 industry AI playbooks
   - exact content-count and quality contract
3. `feat/odoo-lead-integration`
   - protected consultation form
   - same-origin lead-intake client
   - Cloudflare Turnstile support
   - Kong declarative gateway policy
   - Caddy edge routing example
   - Odoo campaign adapter contract and OpenAPI schema

The pull requests are stacked in that order. Do not merge a child branch before its parent or squash all three concerns into one unreviewable change.

## Landing content

`src/content/landing/*.json` is loaded with `import.meta.glob`. A JSON file can contain one page or an array. The reusable React page renders the user experience, while `scripts/generate-seo.mjs` writes crawlable route HTML and the sitemap after the Vite build.

Each record carries unique page language, target keywords, capabilities, outcomes, and FAQ content. The quality script rejects duplicate slugs/headlines, thin descriptions, missing generated HTML, and missing sitemap entries.

## Performance model

The public routes use lazy loading, system fonts, CSS/SVG illustration, immutable fingerprinted assets, gzip at Nginx, and a strict initial JS/CSS budget. Lighthouse CI evaluates representative public routes. The thresholds are release gates, not a promise that every production measurement will be identical; CDN, DNS, third-party scripts, server response time, and real devices still affect field performance.

## Lead security boundary

The browser never receives Odoo credentials and never calls Odoo directly. It submits a versioned lead command to a same-origin endpoint. Caddy terminates the public edge, Kong applies policy and routing, and the private adapter validates and maps the command to an allowlisted Odoo campaign. n8n receives a downstream event only after the CRM write is accepted.
