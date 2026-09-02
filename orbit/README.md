# Codestra Orbit adoption

This repository is the Wave A reference consumer for Codestra Orbit v2.

## Source authority

- Authority repository: `appolon1908-hue/SDK-repository`
- Authority PR: `#75`
- Candidate artifact source commit: `b537296b9ea34161d8ab367fd436a6d7194dcb40`
- Consumer branch: `codex/codestra-orbit-v2-codestra`
- Canonical production domain: `codestra.co`

The current branch carries a dependency-free reference adapter because the authority PR is not merged. After protected approval, replace the adapter with SHA-256-verified `@corporate/*` artifacts from the authority release manifest without changing the route, session, or visual contracts.

## Authentication boundary

Browser code uses only:

- `GET /auth/session`
- `GET /auth/login?return_to=...`
- `GET /auth/signup?return_to=...`
- `POST /auth/logout`
- `POST /auth/logout-all`

OAuth/OIDC tokens stay server-side. The application never writes an access, refresh, or identity token to browser storage. Protected routes preserve a same-origin deep link and fail closed when the session service is unavailable.

## New page and suite rule

A pull request that adds a route or page must update `orbit/routes.json` and, when applicable, `orbit/page-templates.json`. It must declare:

- route owner and canonical domain;
- authentication class;
- shell and footer variant;
- content keys and asset IDs;
- loading, empty, degraded, offline, error, permission-denied, and success states;
- responsive, keyboard, screen-reader, localization, SEO, analytics, security, performance, visual-regression, API-contract, audit, and rollback evidence.

The CI workflow blocks browser token storage, new raw colors, gradients, blur/glass effects, large-radius drift, missing shared shell markers, missing footer attribution, and unregistered page additions.
