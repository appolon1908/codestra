# Codestra website lead intake deployment runbook

## Scope

This runbook deploys the qualified project form from `codestra.co` through the existing Caddy and Kong middleware into the Codestra Odoo CRM campaign, then emits a durable signed event for n8n automation.

It does **not** authorize a production activation by itself. Live writes remain disabled until the environment-specific evidence below is complete and the named release owner approves the change.

## Authoritative flow

```text
Public browser
  POST /api/leads/v1/consultations
        │
        ▼
Caddy public edge
  TLS, request size, private upstream mTLS
        │
        ▼
Kong
  HTTPS-only route, CORS, rate limit, correlation ID, metrics
        │
        ▼
Private FastAPI lead adapter
  strict schema, origin, dwell, Turnstile, idempotency lease
        │
        ├── PostgreSQL command state
        │
        ├── Odoo 19 JSON-2 API → crm.lead
        │
        └── transactional outbox → signed n8n webhook
```

Odoo and n8n are never called from React. No Odoo database name, API key, user credential, numeric campaign ID, n8n URL, or signing secret may be stored in a `VITE_` variable.

## Branch and merge order

1. `feat/website-modern-shell`
2. `feat/ai-seo-landing-pages`
3. `feat/odoo-lead-integration`

The lead branch is stacked on the SEO branch. Merge and verify each parent before merging its child. Do not cherry-pick the form into `main` without the feature-route and landing-catalog foundations it depends on.

## Pre-deployment evidence

Record each item in the change ticket:

- exact website commit SHA and container digest;
- exact adapter commit SHA and container digest;
- successful frontend build, tests, SEO checks, asset budgets, and Lighthouse reports;
- successful adapter lint, tests, migration, and image build;
- Odoo staging database backup and restore evidence;
- installed `codestra_web_lead` addon version;
- staging campaign and source IDs;
- dedicated Odoo API service user and least-privilege review;
- Turnstile production site key and secret stored separately;
- Caddy-to-Kong mTLS certificate chain and expiration review;
- Kong route validation and public rate-limit test;
- n8n signature verification, event deduplication, and replay test;
- production reviewer, activation owner, rollback owner, and maintenance window;
- a canary lead with an approved test address and expected CRM/n8n evidence.

## Safe initial environment

Begin with:

```dotenv
ODOO_WRITE_ENABLED=false
N8N_DELIVERY_ENABLED=false
```

At this stage:

- the website can be deployed;
- the adapter liveness endpoint can pass;
- adapter readiness must remain `503 not_ready`;
- no lead may be represented to a user as accepted by Odoo;
- no n8n workflow may receive live events.

## Odoo staging preparation

1. Install the addon from `odoo/addons/codestra_web_lead`.
2. Resolve the numeric IDs of:
   - `codestra_web_lead.utm_campaign_codestra_web_ai`;
   - `codestra_web_lead.utm_source_codestra_website`.
3. Configure the adapter-only maps:

```dotenv
ODOO_EXTERNAL_ID_FIELD=x_codestra_external_lead_id
ODOO_CAMPAIGN_MAP_JSON={"CODESTRA-WEB-AI":17}
ODOO_SOURCE_MAP_JSON={"website":9}
```

4. Confirm the service user can:
   - search `crm.lead` by `x_codestra_external_lead_id`;
   - create a lead with the allowlisted standard fields;
   - read the mapped UTM campaign and source.
5. Confirm the service user cannot access unrelated administrative models or broad credentials.
6. Create the same semantic lead twice with one idempotency key. Expected result: one Odoo lead and one accepted command record.
7. Simulate a lost Odoo response after lead creation. Expected result: retry finds the external ID and reconciles rather than creating another lead.

## Database migration

Run migrations as a one-shot job before the adapter service starts:

```bash
docker compose \
  -f infra/docker/docker-compose.lead-intake.yml \
  build lead-migrate codestra-lead-adapter

docker compose \
  -f infra/docker/docker-compose.lead-intake.yml \
  run --rm lead-migrate
```

Verify:

```sql
SELECT version, applied_at FROM schema_migrations ORDER BY applied_at;
SELECT status, COUNT(*) FROM lead_intake_commands GROUP BY status;
SELECT status, COUNT(*) FROM lead_outbox GROUP BY status;
```

## Kong deployment

The reference file is `infra/kong/lead-intake.kong.yml`.

Before applying it:

- confirm `codestra-lead-adapter:8080` resolves only on the private Kong network;
- use a distributed rate-limit policy if more than one independent Kong data plane serves this route;
- preserve `Idempotency-Key`, `X-Codestra-Form-Version`, and `X-Correlation-ID` end-to-end;
- do not configure gateway retries for the POST route;
- confirm only `POST` and `OPTIONS` are accepted;
- confirm requests larger than 128 KB are rejected;
- confirm unauthorized origins fail preflight;
- confirm metrics do not include request bodies.

Apply the declarative fragment through the authoritative Kong deployment process. Do not replace unrelated routes with this partial file.

## Caddy deployment

Merge the route from `infra/caddy/Caddyfile.lead-intake` into the authoritative Caddy configuration.

Required properties:

- public TLS only at `codestra.co` and `www.codestra.co`;
- only `/api/leads/v1/consultations` forwarded to Kong;
- mTLS from Caddy to the private Kong listener;
- CA, client certificate, and client key mounted as runtime secrets;
- no public access to Kong Admin API or the adapter;
- existing website routes continue to the website upstream;
- JSON logs exclude request bodies and authorization material.

Validate and reload using the established Caddy service procedure, then confirm the previous configuration can be restored immediately.

## Staging activation

1. Deploy the website and adapter with both write flags false.
2. Verify:

```bash
curl -fsS http://codestra-lead-adapter:8080/health/live
curl -sS -o /dev/null -w '%{http_code}\n' \
  http://codestra-lead-adapter:8080/health/ready
```

Expected readiness: `503` until Odoo writes are enabled.

3. Enable only:

```dotenv
ODOO_WRITE_ENABLED=true
N8N_DELIVERY_ENABLED=false
```

4. Restart the adapter and require `/health/ready` to return `200`.
5. Submit one approved staging canary through the public route.
6. Verify all of the following share the same lead/correlation evidence:
   - browser receives `202 accepted`;
   - Kong access log and metric show one request;
   - `lead_intake_commands` is `accepted`;
   - exactly one Odoo lead exists with the external Codestra lead ID;
   - campaign and source are correct;
   - consent and attribution are present;
   - one pending outbox event exists.
7. Retry the exact command with the same idempotency key. Expected response: `200 duplicate`; Odoo count remains one.

## n8n activation

The n8n receiving workflow must first implement:

- raw request-body preservation;
- maximum timestamp skew check;
- HMAC-SHA256 signature verification before JSON processing;
- durable deduplication by `X-Codestra-Event-ID`;
- explicit support for `codestra.lead.accepted` version `1`;
- a 2xx response only after durable local acceptance;
- failure and dead-letter visibility;
- no live customer communication unless separately approved.

After staging replay and duplicate tests pass, enable:

```dotenv
N8N_DELIVERY_ENABLED=true
```

Confirm the pending event is delivered once, marked `delivered`, and a replay of the same event ID does not repeat downstream work.

## Production canary

Activate in the approved maintenance window:

1. take or verify the current Odoo and PostgreSQL backups;
2. deploy immutable website and adapter images by digest;
3. apply the approved Odoo addon, database migration, Kong route, and Caddy route;
4. keep both live flags false while validating liveness, TLS, mTLS, routing, metrics, and rollback;
5. enable Odoo writes;
6. submit one approved production canary;
7. verify one CRM lead and one outbox event;
8. enable n8n delivery only after the CRM evidence passes;
9. verify signed delivery and deduplication;
10. monitor 4xx/5xx rate, adapter readiness, Odoo latency, command failures, pending/dead outbox count, and duplicate responses.

Do not use an actual customer as the first canary.

## Rollback

Rollback is capability-first:

1. set `N8N_DELIVERY_ENABLED=false`;
2. set `ODOO_WRITE_ENABLED=false`;
3. confirm readiness becomes `503` and no new CRM writes occur;
4. preserve PostgreSQL command and outbox evidence;
5. restore the previous Caddy and Kong configuration if routing is implicated;
6. restore the previous website and adapter image digests;
7. do not delete accepted Odoo leads automatically—reconcile them by external lead ID;
8. do not discard pending outbox events—retain them for controlled replay;
9. restore Odoo only when a database-level failure requires it and the restore owner authorizes it.

## Production acceptance criteria

Production is accepted only when:

- public form success corresponds to an accepted Odoo command;
- duplicate and concurrent submissions create one lead;
- a lost response is recovered through the external ID;
- invalid campaign codes never reach Odoo create;
- Turnstile, origin, payload, and rate-limit controls are effective;
- browser bundles contain no server secret or numeric Odoo mapping;
- n8n rejects an invalid signature and deduplicates a valid replay;
- all quality gates are green at the exact release SHA;
- rollback has been executed in staging against the same deployment method.
