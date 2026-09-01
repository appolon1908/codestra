# Codestra Production Readiness Gate — Codestra Website

Status: NOT PRODUCTION CERTIFIED

Governed by `Infustruction-repo/CODESTRA_PRODUCTION_READINESS_WAVE_20260901.md`.

Required: exact-head frontend CI; Critical=0; High=0; secure same-origin API/BFF behavior; no browser secrets/tokens; accessibility/performance/SEO checks; privacy/legal pages; forms routed through the approved Caddy/Kong/Middleware path; observability; immutable build; staging E2E; rollback; production read-back. Do not modify SSH access or enable provider/business effects directly from the website.
