from __future__ import annotations

import json
from types import SimpleNamespace
from uuid import UUID

import pytest
from starlette.requests import Request

from app.database import CommandClaim
from app.main import create_consultation_lead
from app.models import LeadCommand


class ProcessingDatabase:
    async def claim_command(
        self,
        command: LeadCommand,
        idempotency_key: UUID,
        correlation_id: str,
    ) -> CommandClaim:
        assert idempotency_key == command.leadId
        assert correlation_id == "correlation-processing"
        return CommandClaim(state="processing")


@pytest.mark.asyncio
async def test_processing_command_returns_retryable_conflict(
    settings,
    lead_command: LeadCommand,
    lead_id: UUID,
) -> None:
    runtime = SimpleNamespace(
        settings=settings,
        database=ProcessingDatabase(),
        http_client=None,
        odoo=None,
        outbox=None,
    )
    fake_app = SimpleNamespace(state=SimpleNamespace(runtime=runtime))
    request = Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "POST",
            "scheme": "https",
            "path": "/api/leads/v1/consultations",
            "raw_path": b"/api/leads/v1/consultations",
            "query_string": b"",
            "headers": [(b"origin", b"https://codestra.co")],
            "client": ("10.40.0.1", 44321),
            "server": ("codestra-lead-adapter", 8080),
            "app": fake_app,
        }
    )
    request.state.correlation_id = "correlation-processing"

    response = await create_consultation_lead(
        request=request,
        command=lead_command,
        idempotency_key=lead_id,
        form_version="1.0",
    )

    assert response.status_code == 409
    assert response.headers["retry-after"] == "5"
    body = json.loads(response.body)
    assert body["code"] == "REQUEST_IN_PROGRESS"
    assert body["correlationId"] == "correlation-processing"
