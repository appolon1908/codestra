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

The integrated shell uses the existing cookie-session API:

- `GET /api/auth/session/`
- `POST /api/auth/login/` and the existing registration endpoint
- `POST /api/auth/refresh-session/` with a shared refresh promise
- `POST /api/auth/logout/`

The current SessionProvider, login and signup forms remain the authentication authority. The Orbit header and dashboard use that provider; they do not switch the live backend contract. No access or refresh token is stored in browser storage. The middleware `/auth` adapter in `src/lib/browserSession.ts` remains a reference for the separately certified middleware integration. Its logout-all operation is not exposed by the active cookie-session dashboard because the current backend contract does not provide it.

Logout cancels outstanding session queries and invalidates manual refresh results from an earlier authentication generation, preventing a late response from restoring a signed-out user. Public legal routes and nearby form policy links are retained.

## New page and suite rule

A pull request that adds a route or page must update `orbit/routes.json` and, when applicable, `orbit/page-templates.json`. It must declare:

- route owner and canonical domain;
- authentication class;
- shell and footer variant;
- content keys and asset IDs;
- loading, empty, degraded, offline, error, permission-denied, and success states;
- responsive, keyboard, screen-reader, localization, SEO, analytics, security, performance, visual-regression, API-contract, audit, and rollback evidence.

The CI workflow blocks browser token storage, new raw colors, gradients, blur/glass effects, large-radius drift, missing shared shell markers, missing footer attribution, and unregistered page additions.
