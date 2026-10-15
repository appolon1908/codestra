from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

import pytest

from app.config import Settings
from app.models import LeadCommand


@pytest.fixture
def settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/codestra_leads_test",
        ODOO_BASE_URL="https://odoo.example.test",
        ODOO_DATABASE="codestra-test",
        ODOO_API_KEY="test-api-key",
        ODOO_CAMPAIGN_MAP_JSON='{"CODESTRA-WEB-AI": 17}',
        ODOO_SOURCE_MAP_JSON='{"website": 9}',
        TURNSTILE_REQUIRED=False,
        TURNSTILE_SECRET_KEY="",
        ODOO_WRITE_ENABLED=True,
        N8N_DELIVERY_ENABLED=False,
    )


@pytest.fixture
def command_payload() -> dict[str, Any]:
    return {
        "schemaVersion": "1.0",
        "leadId": "2b3fca51-f421-4e7e-bc3d-6a47fb54bcfa",
        "submittedAt": datetime.now(UTC).isoformat(),
        "campaign": {"code": "CODESTRA-WEB-AI"},
        "contact": {
            "fullName": "Ada Lovelace",
            "workEmail": "ada@example.com",
            "phone": "+1 555 0100",
        },
        "company": {
            "name": "Analytical Engines LLC",
            "jobTitle": "Founder",
            "companySize": "11-50",
        },
        "qualification": {
            "service": "ai-agent-development",
            "industry": "professional-services",
            "budget": "25k-75k",
            "timeline": "quarter",
            "message": "We need to automate a multi-step research and CRM workflow.",
        },
        "consent": {
            "privacyAccepted": True,
            "marketingOptIn": False,
            "policyVersion": "2026-08-26",
        },
        "attribution": {
            "landingPath": "/services/ai-agent-development?utm_source=test",
            "referrer": "https://www.google.com/",
            "utmSource": "test",
            "utmMedium": "search",
            "utmCampaign": "ai-services",
            "utmTerm": "ai agent company",
            "utmContent": "hero",
            "clickId": "click-123",
        },
        "antiAbuse": {
            "turnstileToken": "test-turnstile-token",
            "honeypot": "",
            "dwellMs": 5000,
        },
    }


@pytest.fixture
def lead_command(command_payload: dict[str, Any]) -> LeadCommand:
    return LeadCommand.model_validate(command_payload)


@pytest.fixture
def lead_id() -> UUID:
    return UUID("2b3fca51-f421-4e7e-bc3d-6a47fb54bcfa")
