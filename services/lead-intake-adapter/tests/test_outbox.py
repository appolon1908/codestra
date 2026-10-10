from __future__ import annotations

import hashlib
import hmac
import json
from uuid import UUID

import httpx
import pytest
import respx

from app.database import OutboxEvent
from app.outbox import OutboxWorker


class FakeDatabase:
    def __init__(self, event: OutboxEvent) -> None:
        self.event = event
        self.delivered: list[UUID] = []
        self.rescheduled: list[tuple[OutboxEvent, str]] = []

    async def claim_outbox_event(self) -> OutboxEvent | None:
        event, self.event = self.event, None  # type: ignore[assignment]
        return event

    async def mark_outbox_delivered(self, event_id: UUID) -> None:
        self.delivered.append(event_id)

    async def reschedule_outbox(self, event: OutboxEvent, safe_error: str) -> None:
        self.rescheduled.append((event, safe_error))

    async def cleanup_retention(self) -> tuple[int, int]:
        return 0, 0


@pytest.mark.asyncio
@respx.mock
async def test_n8n_request_is_hmac_signed(settings) -> None:
    event = OutboxEvent(
        event_id=UUID("ef49ab48-adbc-4f75-8e9b-eed5f6f9a1aa"),
        aggregate_id=UUID("2b3fca51-f421-4e7e-bc3d-6a47fb54bcfa"),
        event_type="codestra.lead.accepted",
        event_version=1,
        payload={"eventType": "codestra.lead.accepted", "lead": {"leadId": "abc"}},
        attempts=1,
    )
    database = FakeDatabase(event)
    configured = settings.model_copy(
        update={
            "N8N_DELIVERY_ENABLED": True,
            "N8N_WEBHOOK_URL": "https://n8n.example.test/webhook/codestra-leads",
            "N8N_SIGNING_SECRET": "a-secure-signing-secret-with-more-than-32-characters",
        }
    )
    route = respx.post("https://n8n.example.test/webhook/codestra-leads").mock(
        return_value=httpx.Response(202, json={"accepted": True})
    )

    async with httpx.AsyncClient() as http_client:
        delivered = await OutboxWorker(  # type: ignore[arg-type]
            configured,
            database,
            http_client,
        )._deliver_one()

    assert delivered is True
    assert database.delivered == [event.event_id]
    assert database.rescheduled == []
    request = route.calls.last.request
    timestamp = request.headers["x-codestra-timestamp"]
    body = request.content
    expected = hmac.new(
        configured.N8N_SIGNING_SECRET.encode(),
        f"{timestamp}.".encode() + body,
        hashlib.sha256,
    ).hexdigest()
    assert request.headers["x-codestra-signature"] == f"sha256={expected}"
    assert request.headers["x-codestra-event-id"] == str(event.event_id)
    assert json.loads(body) == event.payload
