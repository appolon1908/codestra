# Codestra website

Responsive Codestra marketing site and client workspace built with React, TypeScript, Vite, and Tailwind CSS.

## Local development

```bash
npm ci
npm run dev
```

Set `VITE_API_ENDPOINT` to the account/API service URL before testing live forms, login, and signup.

## Quality checks

```bash
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run audit:production
```

The browser suite verifies all public routes, mobile navigation, contact-form completion, protected-route behavior, and browser runtime errors.

## GitHub Actions

- `.github/workflows/ci.yml` validates pull requests and pushes to `main` with lint, unit tests, browser tests, production build, dependency audit, container build, and Trivy scanning.
- `.github/workflows/deploy.yml` is a manual production workflow. It publishes an immutable image to GitHub Container Registry and deploys only when its `deploy` input is enabled.

Configure the repository variable:

- `VITE_API_ENDPOINT`

Configure these GitHub environment secrets for `production`:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_KNOWN_HOSTS`
- `GHCR_USER`
- `GHCR_PULL_TOKEN`

The production server must have Docker Compose and `/srv/codestra/`. The deployment workflow uploads `compose.yaml`, pulls the commit-addressed GHCR image, waits for the health check, and leaves the previous immutable image available for rollback.
