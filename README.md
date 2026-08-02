# Codestra website

Responsive Codestra marketing site and client workspace built with React, TypeScript, Vite, and Tailwind CSS.

## Local development

```bash
npm ci
npm run dev
```

Set `VITE_API_ENDPOINT` to the account/API service URL before testing live login and signup.

## Quality checks

```bash
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite verifies all public routes, mobile navigation, contact-form completion, protected-route behavior, and browser runtime errors.

## Deployment

The Bitbucket pipeline deploys commits merged into `main`. It connects to the configured server, updates the repository, and recreates the Docker Compose service. The following repository variables must be configured in Bitbucket:

- `SERVER_IP`
- `SERVER_USER`
- `SERVER_PASSWORD`

The server must already have the repository at `~/codestra`, Docker Compose, and the external `odoo_proxy_network` network. Review branches do not deploy automatically; merge an approved pull request into protected `main` to start deployment.
