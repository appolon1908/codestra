# Repository Profile — `codestra`

## Identity

- **Repository:** `appolon1908-hue/codestra`
- **Category:** Corporate website and dashboard frontend
- **Visibility:** `private`
- **Default branch:** `main`
- **Authority:** Primary Codestra React frontend authority
- **Status:** Implemented React/TypeScript/Vite frontend with CI and container guidance.

## Purpose

Public Codestra website and authenticated dashboard frontend, built as a static React application served behind a TLS reverse proxy.

## Owns

- Public website UI
- Authenticated dashboard UI
- Browser API client and frontend build/deployment assets

## Does not own

- Backend authorization or business rules
- Secrets in browser configuration
- Direct provider or database access

## Key integrations

- codestra backend API
- Caddy/Kong edge path
- Keycloak or backend-managed authentication

## Current priorities

1. Complete secure HttpOnly-cookie/BFF migration where planned
2. Maintain SEO, accessibility, performance, and legal pages
3. Keep API endpoint public and non-secret
4. Require manual protected production deployment

## Governance and safety

- Target promotion model: `feature/docs/fix/security/upgrade -> development -> test -> staging -> production -> main`.
- Use pull requests and exact-head/merge-result validation; merging source never authorizes deployment.
- Never commit secrets, credentials, private keys, customer data, database dumps, or secret-bearing evidence.
- Production images and releases must be immutable; mutable `latest` tags are not release authority.
- This document does not deploy software, enable live effects, apply identity state, alter DNS/firewalls, reload Caddy, expose native ports, initialize OpenBao, or activate production.

## Account-wide catalog

See `appolon1908-hue/documentaions/REPOSITORY_CATALOG.md`.
