# Secure CI and deployment scaffolding

## Current state

Production activation is intentionally fail-closed.

`deploy/runtime-paths.production.json` is committed with every verification flag set to `false`, empty runtime paths, port `0`, and `activationEnabled: false`. The activation job cannot pass until read-only host evidence is reviewed and a separate pull request records the verified values.

The expected public DNS target is `49.12.145.107`. This value is an identity check only; it is not proof of the server's application paths, Compose project, loopback port, reverse-proxy mapping, or rollback layout.

## Why the previous workflow was disabled

The earlier workflow assumed `/srv/codestra`, uploaded directly to `compose.yaml.next`, replaced the active Compose file, and deployed a mutable SHA tag. It did not prove the runtime paths, bind deployment to an image digest, record evidence, or exercise rollback before changing production.

The new workflow separates four concerns:

1. normal source and container CI;
2. immutable image publication with scan, SBOM, BuildKit provenance, release tuple, and keyless signature;
3. read-only runtime inspection;
4. production activation only after a reviewed runtime manifest is enabled.

## CI gate

`npm run test:deployment` checks that:

- the runtime manifest is structurally valid;
- activation remains blocked until evidence is committed;
- production Compose accepts an immutable `@sha256:` image and contains no server-side build;
- the read-only preflight script contains no write-capable commands;
- the deployment workflow requires a full source SHA, image digest, runtime-manifest digest, protected environment, and explicit activation phrase;
- the release workflow creates BuildKit provenance, a keyless Cosign signature, and security evidence.

The normal `verify` command includes this gate.

## Immutable image release

Run **Release immutable image** from `main` with a full 40-character `source_sha`.

The workflow rejects a source unless it is the exact current `main` head. It builds and verifies the frontend, generates a CycloneDX SBOM, produces vulnerability evidence, enforces the HIGH/CRITICAL scan gate, and only publishes when `publish=true`.

When publishing, BuildKit attaches maximum-mode provenance and an SBOM to the registry image. After the exact registry digest passes the vulnerability gate, Cosign signs that digest with the GitHub Actions OIDC identity of `.github/workflows/release-image.yml@refs/heads/main`. The workflow immediately verifies the signature, records the signer identity and issuer in `release-manifest.json`, and uploads the verification evidence. A SHA tag may exist for navigation, but deployment accepts only the immutable digest.

The generated tuple must be independently reviewed and committed as `deploy/releases/<source-sha>.json`. Deployment verifies that committed file, its SHA-256, the source SHA, the repository, the image digest, the expected signer workflow, and the GitHub Actions OIDC issuer all agree. It then performs an online Cosign verification of the private GHCR image before any production environment job starts. This prevents an operator from supplying an unrelated image digest at activation time.

Publishing an image does not connect to or change the production server.

## Read-only runtime verification

Run **Verify production runtime paths** from `main` only after the production environment reviewer approves the inspection.

The operator supplies candidate values observed from existing server documentation:

- release root;
- releases directory;
- current-release symlink;
- Compose project;
- service name;
- loopback port;
- reverse proxy.

The confirmation must be exactly `READ_ONLY_PREFLIGHT`.

The remote script is streamed to `bash` over SSH and does not upload a file. It reads host identity, Docker/Compose availability, path type/ownership/mode, current symlink target, relevant Compose containers, loopback listener, mount information, and reverse-proxy service state. It does not create a directory, pull an image, log in to a registry, restart a service, or modify a file.

The workflow uploads:

- `preflight-report.txt`;
- `preflight-report.sha256`.

Review that artifact independently. Store no secrets in the report.

## Recording verified runtime paths

A separate reviewed change must update `deploy/runtime-paths.production.json`.

Before activation, all of these must be true:

- `runtimePathsVerified`
- `hostKeyVerified`
- `reverseProxyVerified`
- `loopbackBindingVerified`
- `rollbackVerified`
- `activationEnabled`

The manifest must also contain:

- safe absolute paths under a dedicated release root;
- an unprivileged loopback port;
- `caddy` or `nginx`;
- operator identity;
- an ISO-8601 verification time no older than 30 days;
- the SHA-256 of the reviewed evidence bundle.

Do not set `activationEnabled` merely because the path exists. Verify the reverse proxy, port ownership, deployment user's permissions, current release structure, health endpoint, and a real rollback rehearsal.

## Production activation

Run **Plan or activate verified production release** from `main`.

### Plan mode

Plan mode validates the source SHA, image digest, checked-in runtime-manifest digest, reviewed release-manifest path, and reviewed release-manifest digest, then creates a non-invasive `deployment-plan.json`. It performs no SSH connection or remote write.

### Activate mode

Activate mode additionally requires:

- confirmation `DEPLOY_VERIFIED_RUNTIME`;
- deploy-mode runtime-manifest validation;
- approval of the protected `production` environment;
- pinned SSH host trust;
- a read-only preflight immediately before writes;
- a GHCR pull token with package-read access only.

The activation requires an existing, verified rollback baseline behind the current symlink. It stages checksum-bound files in a versioned incoming directory, pulls the exact digest, validates Compose, starts the service with `--no-build`, checks the loopback health endpoint, verifies the running container image ID, and atomically updates the current symlink. If the subsequent public HTTPS smoke test fails, the workflow invokes the installed rollback helper before failing the activation.

No image pruning, volume deletion, database change, firewall change, DNS change, proxy reload, or unrelated service restart is performed.

## Rollback

Before activation, the remote script requires the current symlink to resolve to a complete prior release containing its Compose and environment definitions. If Compose activation, loopback health verification, service discovery, image verification, or the public HTTPS smoke test fails, the previous release is started and the prior symlink is restored.

The scaffold intentionally performs no release cleanup. Retention and cleanup require a separate reviewed operation after successful production evidence exists.

## Required GitHub configuration

Repository variable:

- `VITE_API_ENDPOINT` — public HTTPS API URL embedded into the frontend build.

Protected `production` environment secrets:

- `DEPLOY_HOST` — must equal `49.12.145.107`;
- `DEPLOY_USER`;
- `DEPLOY_SSH_KEY`;
- `DEPLOY_KNOWN_HOSTS` — pinned host-key line, not output from an untrusted runtime scan;
- `GHCR_USER`;
- `GHCR_PULL_TOKEN` — package read only.

Recommended environment controls:

- required reviewer who is not the workflow initiator;
- no self-approval;
- deployment branch restricted to `main`;
- environment secrets unavailable before approval;
- concurrency retained with cancellation disabled.

Recommended branch controls for `main`:

- pull requests required;
- approving review required;
- stale reviews dismissed after new commits;
- CI and Web quality checks required;
- force pushes and deletion blocked;
- administrators included;
- signed commits or equivalent verified identity where operationally practical.

## Evidence required before enabling activation

- exact-head CI pass;
- container scan pass;
- SBOM, BuildKit provenance, Cosign signature, and signature-verification evidence retained;
- runtime preflight artifact reviewed;
- SSH fingerprint independently verified;
- release root and current symlink confirmed;
- current symlink resolves to a complete rollback baseline under the releases directory;
- Compose project and service confirmed;
- loopback port confirmed and not shared;
- Caddy/Nginx upstream mapping confirmed;
- `/healthz` confirmed;
- deployment user permissions confirmed;
- backup and rollback rehearsal confirmed;
- public HTTPS smoke tests defined.

Until that evidence is committed and reviewed, the live server remains unchanged and activation remains blocked.
