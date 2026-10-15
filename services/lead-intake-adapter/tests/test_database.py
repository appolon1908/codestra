from __future__ import annotations

import os
from copy import deepcopy
from pathlib import Path
from uuid import UUID, uuid4

import asyncpg
import pytest

from app.database import Database, IdempotencyConflictError
from app.models import LeadCommand

MIGRATION = (Path(__file__).resolve().parents[1] / "migrations" / "001_init.sql").read_text(
    encoding="utf-8"
)


@pytest.fixture
async def database(settings):
    database_url = os.environ.get("TEST_DATABASE_URL", settings.DATABASE_URL)
    configured = settings.model_copy(update={"DATABASE_URL": database_url})
    connection = await asyncpg.connect(database_url)
    migration = MIGRATION
    try:
        await connection.execute(migration)
        await connection.execute("TRUNCATE lead_outbox, lead_intake_commands CASCADE")
    finally:
        await connection.close()

    instance = Database(configured)
    await instance.connect()
    try:
        yield instance
    finally:
        await instance.close()


@pytest.mark.asyncio
async def test_command_claim_processing_acceptance_and_duplicate(
    database: Database,
    lead_command: LeadCommand,
    lead_id: UUID,
) -> None:
    first = await database.claim_command(lead_command, lead_id, "correlation-1")
    concurrent = await database.claim_command(lead_command, lead_id, "correlation-2")

    assert first.state == "claimed"
    assert concurrent.state == "processing"

    event_id = await database.mark_accepted(lead_command, 1234, "correlation-1")
    duplicate = await database.claim_command(lead_command, lead_id, "correlation-3")

    assert duplicate.state == "duplicate"
    assert duplicate.odoo_lead_id == 1234
    event = await database.pool.fetchrow(
        "SELECT event_id, status, event_type FROM lead_outbox WHERE aggregate_id = $1",
        lead_id,
    )
    assert event is not None
    assert event["event_id"] == event_id
    assert event["status"] == "pending"
    assert event["event_type"] == "codestra.lead.accepted"


@pytest.mark.asyncio
async def test_same_idempotency_key_with_different_command_is_rejected(
    database: Database,
    lead_command: LeadCommand,
    lead_id: UUID,
    command_payload: dict[str, object],
) -> None:
    await database.claim_command(lead_command, lead_id, "correlation-1")

    changed_payload = deepcopy(command_payload)
    changed_payload["leadId"] = str(uuid4())
    changed_payload["qualification"]["message"] = (  # type: ignore[index]
        "This is a materially different request attempting to reuse an idempotency key."
    )
    changed_command = LeadCommand.model_validate(changed_payload)

    with pytest.raises(IdempotencyConflictError):
        await database.claim_command(changed_command, lead_id, "correlation-2")


@pytest.mark.asyncio
async def test_failed_command_can_be_reclaimed_with_fresh_anti_abuse_token(
    database: Database,
    lead_command: LeadCommand,
    lead_id: UUID,
    command_payload: dict[str, object],
) -> None:
    first = await database.claim_command(lead_command, lead_id, "correlation-1")
    assert first.state == "claimed"
    await database.mark_failed(lead_id, "ODOO_UNAVAILABLE", "temporary failure")

    retry_payload = deepcopy(command_payload)
    retry_payload["antiAbuse"]["turnstileToken"] = "fresh-token"  # type: ignore[index]
    retry_payload["antiAbuse"]["dwellMs"] = 10000  # type: ignore[index]
    retry = LeadCommand.model_validate(retry_payload)
    reclaimed = await database.claim_command(retry, lead_id, "correlation-2")

    assert reclaimed.state == "claimed"


@pytest.mark.asyncio
async def test_changed_submission_time_cannot_reuse_command_identity(
    database, lead_command, lead_id
):
    from datetime import timedelta

    await database.claim_command(lead_command, lead_id, "initial")
    changed = lead_command.model_copy(
        update={"submittedAt": lead_command.submittedAt + timedelta(seconds=1)}
    )
    with pytest.raises(IdempotencyConflictError):
        await database.claim_command(changed, lead_id, "retry-with-new-time")
