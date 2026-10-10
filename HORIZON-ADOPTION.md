# Horizon portfolio-shell adoption

## Authority

- Horizon repository: `appolon1908-hue/SDK-repository`
- Foundation pull request: `#73`
- Visual-contract exact head: `7db4c6549a0a007922355090f03c082a308f3855`
- Governance validator: `b258cf952df3a2ef11a2ba2e0df16c7983ee2a99`
- Adoption branch: `feature/horizon-portfolio-shell-v1`
- Product theme: `codestra`
- Runtime activation: **not included**

The local `src/horizon.css` file is a generated application adapter pinned to the visual contract above. It exists so this npm/Vite repository can adopt the approved contract before the shared package is released. After the package is versioned, replace the adapter with an exact dependency on `@codestra/intake-ui` and import `@codestra/intake-ui/horizon/styles`.

## Canonical domains

| Role | Domain |
|---|---|
| Public website | `https://codestra.co` |
| Identity | `https://auth.codestra.co` |
| Canonical issuer | `https://auth.codestra.co/realms/codestra` |
| Shared API edge | `https://api.codestra.co` |
| Social platform | `https://social.codestra.co` |
| Automation | `https://automation.codestra.co` |

These roles are not interchangeable. Public navigation may link to them, but API and identity hosts are never treated as marketing pages.

## Authentication and logout

The current Codestra frontend uses a real legacy API-session login. It is not described as the final production identity model.

- Login calls the existing `/api/auth/login/` API through `useLogin`.
- Authentication is established by the backend cookie-session endpoint; browser bearer-token storage is forbidden.
- Protected wildcard routes fail closed through `AuthProvider`.
- A protected deep link is preserved as a validated same-origin `next` path.
- The shared header reflects the shared SessionProvider and reacts to login, logout, and backend session expiry.
- Logout disables duplicate clicks, invokes the backend logout endpoint, and clears the shared session cache.
- Backend permission, tenant, record, capability, and state checks remain authoritative.
- The migration target is Keycloak Authorization Code Flow with PKCE S256 and durable identity `issuer + subject`.
- Browser bearer-token storage is explicitly `forbidden`.

Public-only repositories must not copy these account buttons unless they also provide a real registered session implementation.

## Page and color rule

The application root in `index.html` defines the Horizon theme once. Every page must inherit that root and the shared layout components.

New pages must:

- use Horizon variables instead of raw colors;
- preserve authentication and authorization boundaries;
- define every applicable loading, empty, partial, stale, degraded, unauthorized, forbidden, validation-error, server-error, offline, and durable-success state;
- retain mobile, keyboard, focus, zoom, and reduced-motion behavior;
- avoid fake data, controls, balances, campaigns, activity, orders, testimonials, or provider state.

Raw color values may exist only in the registered root token files. The pinned CI validator rejects new raw colors in page and component changes.

## Header contract

The shared header provides:

- Codestra identity and canonical public-domain label;
- Home, Services, Case studies, About, and Contact navigation;
- real session-aware Login/Dashboard/Logout controls;
- accessible desktop and mobile navigation;
- visible keyboard focus;
- one dominant account action.

## Footer contract

The shared corporate footer provides:

- public, identity, API, and social domain references;
- service navigation;
- Codestra product-network links;
- company and legal links;
- support email and legal entity;
- consistent responsive structure.

## Adding a suite

A new application or suite cannot be merged only by adding a directory. It must first be registered in `horizon/suite.json` with:

1. canonical HTTPS domains and surface type;
2. root layout, page roots, theme, token file, and header/footer or operator-shell files;
3. real login, session, route-guard, and logout source files when protected routes exist;
4. identity issuer/client/scopes/audience/roles and durable identity model;
5. backend-authoritative authorization declaration;
6. page-state, accessibility, test, security, deployment, and rollback gates.

`.github/workflows/horizon-contract.yml` invokes the immutable central validator. It rejects missing registration, fake authentication controls, protected pages without auth evidence, missing root markers, missing token variables, and new raw colors.

## Validation

```bash
npm ci
npm run lint
npm test
npm run build
npm run audit:production
```

This branch changes source only. It does not activate OIDC, publish a logout endpoint, modify DNS, deploy a runtime, or enable production traffic.
