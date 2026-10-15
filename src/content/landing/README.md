# Landing-page content

JSON files in this directory may contain one landing-page object or an array of objects. The catalog validates every record before it becomes a public route.

Required fields: `slug`, `kind`, `name`, `eyebrow`, `headline`, `description`, `challenge`, `approach`, `capabilities`, `outcomes`, `keywords`, and `faqs`.

Kinds map to routes:

- `service` → `/services/:slug`
- `industry` → `/industries/:slug`

The expansion branch adds 30 AI/development service records and 25 industry playbooks here without changing application code.
