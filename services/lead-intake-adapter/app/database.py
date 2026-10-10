from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Literal
from uuid import UUID, uuid4

import asyncpg

from .config import Settings
from .models import LeadCommand


class IdempotencyConflictError(RuntimeError):
    pass


@dataclass(frozen=True, slots=True)
class CommandClaim:
    state: Literal["claimed", "duplicate", "processing"]
    odoo_lead_id: int | None = None


@dataclass(frozen=True, slots=True)
class OutboxEvent:
    event_id: UUID
    aggregate_id: UUID
    event_type: str
    event_version: int
    payload: dict[str, Any]
    attempts: int


class Database:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._pool: asyncpg.Pool | None = None

    @property
    def pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("database pool is not initialized")
        return self._pool

    async def connect(self) -> None:
        self._pool = await asyncpg.create_pool(
            dsn=self._settings.DATABASE_URL,
            min_size=1,
            max_size=10,
            command_timeout=15,
            max_inactive_connection_lifetime=300,
        )

    async def close(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    async def ping(self) -> bool:
        try:
            return bool(await self.pool.fetchval("SELECT TRUE"))
        except Exception:  # noqa: BLE001
            return False

    @staticmethod
    def request_hash(command: LeadCommand) -> str:
        canonical = json.dumps(
            command.semantic_payload(),
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")
        return hashlib.sha256(canonical).hexdigest()

    async def claim_command(
        self,
        command: LeadCommand,
        idempotency_key: UUID,
        correlation_id: str,
    ) -> CommandClaim:
        request_hash = self.request_hash(command)
        lease_expires_at = datetime.now(UTC) + timedelta(
            seconds=self._settings.IDEMPOTENCY_LEASE_SECONDS
        )

        async with self.pool.acquire() as connection, connection.transaction():
            inserted = await connection.fetchval(
                """
                INSERT INTO lead_intake_commands (
                    lead_id,
                    idempotency_key,
                    request_hash,
                    schema_version,
                    status,
                    payload,
                    correlation_id,
                    attempts,
                    lease_expires_at
                )
                VALUES ($1, $2, $3, $4, 'processing', $5::jsonb, $6, 1, $7)
                ON CONFLICT (idempotency_key) DO NOTHING
                RETURNING TRUE
                """,
                command.leadId,
                idempotency_key,
                request_hash,
                command.schemaVersion,
                json.dumps(command.stored_payload()),
                correlation_id,
                lease_expires_at,
            )
            if inserted:
                return CommandClaim(state="claimed")

            row = await connection.fetchrow(
                """
                SELECT lead_id, request_hash, status, odoo_lead_id, lease_expires_at
                FROM lead_intake_commands
                WHERE idempotency_key = $1
                FOR UPDATE
                """,
                idempotency_key,
            )
            if row is None:
                raise RuntimeError("idempotency row disappeared during claim")
            if row["lead_id"] != command.leadId or row["request_hash"] != request_hash:
                raise IdempotencyConflictError(
                    "Idempotency-Key was already used for a different lead command"
                )
            if row["status"] == "accepted":
                return CommandClaim(state="duplicate", odoo_lead_id=row["odoo_lead_id"])

            now = datetime.now(UTC)
            existing_lease = row["lease_expires_at"]
            if row["status"] == "processing" and existing_lease and existing_lease > now:
                return CommandClaim(state="processing", odoo_lead_id=row["odoo_lead_id"])

            await connection.execute(
                """
                UPDATE lead_intake_commands
                SET status = 'processing',
                    attempts = attempts + 1,
                    lease_expires_at = $2,
                    correlation_id = $3,
                    last_error_code = NULL,
                    last_error_message = NULL,
                    updated_at = NOW()
                WHERE idempotency_key = $1
                """,
                idempotency_key,
                lease_expires_at,
                correlation_id,
            )
            return CommandClaim(state="claimed", odoo_lead_id=row["odoo_lead_id"])

    async def mark_failed(
        self,
        lead_id: UUID,
        code: str,
        safe_message: str,
    ) -> None:
        await self.pool.execute(
            """
            UPDATE lead_intake_commands
            SET status = 'failed',
                lease_expires_at = NULL,
                last_error_code = $2,
                last_error_message = LEFT($3, 500),
                updated_at = NOW()
            WHERE lead_id = $1 AND status = 'processing'
            """,
            lead_id,
            code,
            safe_message,
        )

    async def mark_accepted(
        self,
        command: LeadCommand,
        odoo_lead_id: int,
        correlation_id: str,
    ) -> UUID:
        event_id = uuid4()
        event_payload = {
            "eventId": str(event_id),
            "eventType": "codestra.lead.accepted",
            "eventVersion": 1,
            "occurredAt": datetime.now(UTC).isoformat(),
            "correlationId": correlation_id,
            "lead": {
                "leadId": str(command.leadId),
                "odooLeadId": odoo_lead_id,
                "campaignCode": command.campaign.code,
                "service": command.qualification.service,
                "industry": command.qualification.industry,
                "marketingOptIn": command.consent.marketingOptIn,
                "attribution": command.attribution.model_dump(mode="json"),
            },
        }

        async with self.pool.acquire() as connection, connection.transaction():
            await connection.execute(
                """
                UPDATE lead_intake_commands
                SET status = 'accepted',
                    odoo_lead_id = $2,
                    lease_expires_at = NULL,
                    correlation_id = $3,
                    accepted_at = COALESCE(accepted_at, NOW()),
                    updated_at = NOW()
                WHERE lead_id = $1
                """,
                command.leadId,
                odoo_lead_id,
                correlation_id,
            )
            inserted_event_id = await connection.fetchval(
                """
                INSERT INTO lead_outbox (
                    event_id,
                    aggregate_id,
                    event_type,
                    event_version,
                    payload,
                    status,
                    available_at
                )
                VALUES ($1, $2, 'codestra.lead.accepted', 1, $3::jsonb, 'pending', NOW())
                ON CONFLICT (aggregate_id, event_type, event_version)
                DO UPDATE SET payload = EXCLUDED.payload
                RETURNING event_id
                """,
                event_id,
                command.leadId,
                json.dumps(event_payload),
            )
        return inserted_event_id

    async def claim_outbox_event(self) -> OutboxEvent | None:
        lease_expires_at = datetime.now(UTC) + timedelta(seconds=30)
        async with self.pool.acquire() as connection, connection.transaction():
            row = await connection.fetchrow(
                """
                SELECT event_id, aggregate_id, event_type, event_version, payload, attempts
                FROM lead_outbox
                WHERE (
                    (status = 'pending' AND available_at <= NOW())
                    OR (status = 'delivering' AND lease_expires_at < NOW())
                )
                  AND attempts < $1
                ORDER BY created_at
                FOR UPDATE SKIP LOCKED
                LIMIT 1
                """,
                self._settings.N8N_OUTBOX_MAX_ATTEMPTS,
            )
            if row is None:
                return None

            await connection.execute(
                """
                UPDATE lead_outbox
                SET status = 'delivering',
                    attempts = attempts + 1,
                    lease_expires_at = $2,
                    last_error = NULL
                WHERE event_id = $1
                """,
                row["event_id"],
                lease_expires_at,
            )
            payload = row["payload"]
            if isinstance(payload, str):
                payload = json.loads(payload)
            return OutboxEvent(
                event_id=row["event_id"],
                aggregate_id=row["aggregate_id"],
                event_type=row["event_type"],
                event_version=row["event_version"],
                payload=dict(payload),
                attempts=row["attempts"] + 1,
            )

    async def mark_outbox_delivered(self, event_id: UUID) -> None:
        await self.pool.execute(
            """
            UPDATE lead_outbox
            SET status = 'delivered',
                lease_expires_at = NULL,
                delivered_at = NOW(),
                last_error = NULL
            WHERE event_id = $1
            """,
            event_id,
        )

    async def reschedule_outbox(self, event: OutboxEvent, safe_error: str) -> None:
        terminal = event.attempts >= self._settings.N8N_OUTBOX_MAX_ATTEMPTS
        delay_seconds = min(3600, 2 ** min(event.attempts, 11))
        await self.pool.execute(
            """
            UPDATE lead_outbox
            SET status = $2,
                lease_expires_at = NULL,
                available_at = NOW() + ($3 * INTERVAL '1 second'),
                last_error = LEFT($4, 500)
            WHERE event_id = $1
            """,
            event.event_id,
            "dead" if terminal else "pending",
            delay_seconds,
            safe_error,
        )

    async def cleanup_retention(self) -> tuple[int, int]:
        command_status = await self.pool.execute(
            """
            DELETE FROM lead_intake_commands
            WHERE created_at < NOW() - ($1 * INTERVAL '1 day')
              AND status IN ('accepted', 'failed')
            """,
            self._settings.COMMAND_RETENTION_DAYS,
        )
        outbox_status = await self.pool.execute(
            """
            DELETE FROM lead_outbox
            WHERE created_at < NOW() - ($1 * INTERVAL '1 day')
              AND status IN ('delivered', 'dead')
            """,
            self._settings.OUTBOX_RETENTION_DAYS,
        )
        return self._parse_delete_count(command_status), self._parse_delete_count(outbox_status)

    @staticmethod
    def _parse_delete_count(status: str) -> int:
        try:
            return int(status.rsplit(" ", 1)[-1])
        except (TypeError, ValueError):
            return 0
