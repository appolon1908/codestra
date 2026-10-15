# Codestra Website Lead Intake — Odoo 19 addon

This addon creates the CRM-side recovery key required by the private lead adapter and seeds the Codestra website campaign/source records.

## What it adds

- `crm.lead.x_codestra_external_lead_id`
  - indexed
  - unique when populated
  - not copied during lead duplication
  - visible read-only to Odoo system administrators
- UTM campaign: `Codestra Website — AI & Development`
- UTM source: `Codestra Website`

## Installation

1. Place `codestra_web_lead` in an Odoo 19 addons path.
2. Update the app list.
3. Install **Codestra Website Lead Intake** in staging first.
4. Confirm the unique constraint can be created. If an older manually created field already exists, reconcile it before installing; do not create a second external-ID field.
5. Resolve the numeric IDs in that database:

```text
utm.campaign external id: codestra_web_lead.utm_campaign_codestra_web_ai
utm.source external id:   codestra_web_lead.utm_source_codestra_website
```

6. Configure the private adapter, never the browser:

```dotenv
ODOO_EXTERNAL_ID_FIELD=x_codestra_external_lead_id
ODOO_CAMPAIGN_MAP_JSON={"CODESTRA-WEB-AI": <campaign-id>}
ODOO_SOURCE_MAP_JSON={"website": <source-id>}
```

7. Give the dedicated adapter service user only the CRM/API access required to search and create leads and read the mapped UTM records.

The public form uses `CODESTRA-WEB-AI`. Numeric database IDs remain private and environment-specific.
