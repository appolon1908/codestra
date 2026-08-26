# Codestra frontend

React, TypeScript, and Vite frontend for the Codestra website and authenticated dashboard.

## Requirements

- Node.js 22
- npm 10 or newer
- An HTTPS API endpoint

## Local development

```bash
cp .env.example .env
npm ci
npm run dev
```

`VITE_API_ENDPOINT` is embedded in the browser bundle. It must be a public URL, never a secret.

## Verification

```bash
npm run lint
npm test
npm run test:deployment
npm run build
npm run test:seo
npm run test:performance
npm run audit:production
```

The complete gate is:

```bash
npm run verify
```

## Container

The production image builds the static bundle and serves it from an unprivileged Nginx process on port 8080. Local Compose publishes it only on host loopback by default so a host reverse proxy can provide TLS.

```bash
VITE_API_ENDPOINT=https://api.example.com docker compose up --build
curl --fail http://127.0.0.1:5000/healthz
```

`deploy/compose.production.yaml` is separate from local Compose. It contains no build section and accepts only a registry image supplied by immutable digest.

## GitHub release and deployment

Pull requests and `main` run source checks, tests, build, deployment-policy validation, dependency audit, container build, and image scanning.

Production is split into three manual workflows:

1. **Release immutable image** builds from the exact current `main` SHA, scans it, creates an SBOM and provenance, and optionally publishes to GHCR. Its generated release tuple must be reviewed and committed under `deploy/releases/` before activation.
2. **Verify production runtime paths** streams a read-only inventory script over SSH and uploads evidence.
3. **Plan or activate verified production release** creates a plan by default and cannot activate while the checked-in runtime manifest is unverified.

The repository deliberately does not assume `/srv/codestra` or port `5000`. Runtime values must be observed, reviewed, and recorded in `deploy/runtime-paths.production.json`. Activation stays blocked until every verification flag and `activationEnabled` are set in a reviewed commit.

See `docs/deployment-security.md` for the complete gate, evidence requirements, rollback model, secrets, and environment protections.

## Security notes

- Authorization must always be enforced by the backend.
- The current backend returns a bearer token consumed by the SPA. Moving authentication to secure `HttpOnly` cookies requires a coordinated backend change and remains recommended.
- Never commit `.env` files, private keys, registry tokens, host fingerprints gathered from an untrusted channel, or production credentials.
- Production dependencies are audited without exceptions in CI.
- Publishing a container is not production activation.
- The live server must remain unchanged until runtime paths, loopback routing, reverse-proxy configuration, permissions, health checks, and rollback are verified.

## License

Proprietary. See `LICENSE`.
