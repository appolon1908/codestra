# Codestra lead-intake adapter

This service is the private write boundary between the public Codestra website and Odoo. It is intentionally isolated from the React application and must be reachable only from Kong on the private network.

## Request path

```text
Browser
  → Caddy public edge
  → Kong route and policies
  → lead-intake adapter
  → Odoo 19 JSON-2 API
  → PostgreSQL command record + outbox
  → signed n8n event delivery
```

The browser sends one versioned command and a matching `Idempotency-Key`. It never receives an Odoo API key, database name, numeric campaign ID, n8n secret, or internal service address.

## Safety defaults

`ODOO_WRITE_ENABLED=false` and `N8N_DELIVERY_ENABLED=false` are the defaults. The readiness endpoint remains `503 not_ready` until CRM writes, the campaign map, database, and anti-abuse configuration are ready. Turning on a flag is a release operation, not an application build step.

## Required Odoo preparation

1. Create a dedicated least-privilege service user and API key.
2. Create a stored indexed text field on `crm.lead` named by `ODOO_EXTERNAL_ID_FIELD` (default `x_codestra_external_lead_id`). It must be available to the service user. This is the authoritative recovery key if Odoo accepted a lead but the adapter lost the response.
3. Create or identify the Codestra website campaign.
4. Map the public code to the numeric Odoo ID in `ODOO_CAMPAIGN_MAP_JSON`, for example `{"CODESTRA-WEB-AI": 17}`.
5. Optionally map the `website` source in `ODOO_SOURCE_MAP_JSON`.
6. Restrict the service user to the minimum CRM models and fields required by the adapter.

Do not place numeric Odoo IDs in the browser bundle. The public campaign code is allowlisted and resolved only in this service.

## Local checks

```bash
cd services/lead-intake-adapter
python -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[test]'
ruff check app tests scripts
pytest -q
```

Run the migration separately:

```bash
DATABASE_URL='postgresql://...' python scripts/migrate.py
```

Start the service after environment variables are present:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

## Health behavior

- `GET /health/live` confirms that the process can serve requests.
- `GET /health/ready` checks PostgreSQL, the campaign map, anti-abuse configuration, and the Odoo live-write flag. It deliberately reports the n8n delivery flag without making n8n a prerequisite for CRM lead acceptance.

## Odoo write behavior

For each claimed command, the adapter first searches `crm.lead` by the external Codestra lead ID. If the record exists, the adapter reconciles its local state instead of creating another lead. Otherwise it creates a lead with standard CRM fields, the allowlisted campaign, source, attribution, consent evidence, and the external ID.

## n8n event

After Odoo acceptance, the adapter records `codestra.lead.accepted` version `1` in the PostgreSQL outbox in the same local transaction that marks the command accepted. The worker signs the exact JSON body with HMAC-SHA256:

```text
signature_input = "<unix_timestamp>." + raw_json_body
X-Codestra-Signature = "sha256=" + hex(hmac_sha256(secret, signature_input))
```

The receiving n8n workflow must verify the timestamp window, signature, event ID, event type, and event version before processing. It must deduplicate `X-Codestra-Event-ID` and return a 2xx response only after its own durable acceptance.

## Logging and privacy

Request bodies, Turnstile tokens, API keys, and form values are not written to application logs. Logs contain correlation IDs, event IDs, status, duration, attempt count, and safe error classes. PostgreSQL contains the accepted command payload and must use encrypted storage, restricted roles, backups, and the configured retention policy.
