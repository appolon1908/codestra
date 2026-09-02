# Horizon portfolio-shell adoption

## Authority

- Horizon repository: `appolon1908-hue/SDK-repository`
- Foundation pull request: `#73`
- Foundation exact head: `7db4c6549a0a007922355090f03c082a308f3855`
- Adoption branch: `feature/horizon-portfolio-shell-v1`
- Product theme: `codestra`
- Runtime activation: **not included**

The local `src/horizon.css` file is a generated application adapter pinned to the exact foundation commit above. It exists so this npm/Vite repository can adopt the approved contract before the shared package is released. After the package is versioned, replace the adapter with an exact dependency on `@codestra/intake-ui` and import `@codestra/intake-ui/horizon/styles`.

## Canonical domains

| Role | Domain |
|---|---|
| Public website | `https://codestra.co` |
| Identity | `https://auth.codestra.co` |
| Shared API edge | `https://api.codestra.co` |
| Social platform | `https://social.codestra.co` |
| Automation | `https://automation.codestra.co` |

These roles are not interchangeable. Public navigation may link to them, but API and identity hosts are never treated as marketing pages.

## Header contract

The shared header provides:

- Codestra identity and canonical public-domain label
- Home, Services, Case studies, About and Contact navigation
- preserved application authentication behavior
- accessible mobile navigation
- visible keyboard focus
- one dominant account action

## Footer contract

The shared corporate footer provides:

- public, identity, API and social domain references
- service navigation
- Codestra product-network links
- company and legal links
- support email and legal entity
- consistent responsive structure

## Validation

Run:

```bash
npm ci
npm run lint
npm test
npm run build
npm run audit:production
```

The adoption must not change backend routes, authentication storage, API contracts, deployment credentials or production runtime state.
