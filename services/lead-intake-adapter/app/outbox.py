from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import logging
import time
from contextlib import suppress

import httpx

from .config import Settings
from .database import Database

logger = logging.getLogger(__name__)


class OutboxWorker:
    def __init__(
        self,
        settings: Settings,
        database: Database,
        client: httpx.AsyncClient,
    ) -> None:
        self._settings = settings
        self._database = database
        self._client = client
        self._stopping = asyncio.Event()
        self._task: asyncio.Task[None] | None = None
        self._last_cleanup = 0.0

    def start(self) -> None:
        if not self._settings.N8N_DELIVERY_ENABLED:
            logger.warning("n8n outbox delivery is disabled by configuration")
        if self._task is None:
            self._task = asyncio.create_task(self._run(), name="lead-n8n-outbox")

    async def stop(self) -> None:
        self._stopping.set()
        if self._task is not None:
            self._task.cancel()
            with suppress(asyncio.CancelledError):
                await self._task
            self._task = None

    async def _run(self) -> None:
        while not self._stopping.is_set():
            try:
                delivered = await self._deliver_one()
                await self._maybe_cleanup()
                if not delivered:
                    await asyncio.wait_for(
                        self._stopping.wait(),
                        timeout=self._settings.N8N_OUTBOX_POLL_SECONDS,
                    )
            except TimeoutError:
                continue
            except asyncio.CancelledError:
                raise
            except Exception:  # noqa: BLE001
                logger.exception("unexpected outbox worker failure")
                await asyncio.sleep(min(10, self._settings.N8N_OUTBOX_POLL_SECONDS * 2))

    async def _deliver_one(self) -> bool:
        if not self._settings.N8N_DELIVERY_ENABLED:
            return False
        event = await self._database.claim_outbox_event()
        if event is None:
            return False

        body = json.dumps(
            event.payload,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")
        timestamp = str(int(time.time()))
        signed = f"{timestamp}.".encode() + body
        digest = hmac.new(
            self._settings.N8N_SIGNING_SECRET.encode("utf-8"),
            signed,
            hashlib.sha256,
        ).hexdigest()

        try:
            response = await self._client.post(
                str(self._settings.N8N_WEBHOOK_URL),
                content=body,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "User-Agent": "codestra-lead-intake-adapter/1.0",
                    "X-Codestra-Event-ID": str(event.event_id),
                    "X-Codestra-Event-Type": event.event_type,
                    "X-Codestra-Event-Version": str(event.event_version),
                    "X-Codestra-Timestamp": timestamp,
                    "X-Codestra-Signature": f"sha256={digest}",
                },
                timeout=self._settings.N8N_REQUEST_TIMEOUT_SECONDS,
            )
            if 200 <= response.status_code < 300:
                await self._database.mark_outbox_delivered(event.event_id)
                logger.info(
                    "outbox event delivered",
                    extra={"event_id": str(event.event_id), "attempts": event.attempts},
                )
                return True
            safe_error = f"n8n returned status {response.status_code}"
        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            safe_error = f"n8n transport failure: {type(exc).__name__}"

        await self._database.reschedule_outbox(event, safe_error)
        logger.warning(
            "outbox event rescheduled",
            extra={
                "event_id": str(event.event_id),
                "attempts": event.attempts,
                "reason": safe_error,
            },
        )
        return True

    async def _maybe_cleanup(self) -> None:
        now = time.monotonic()
        if now - self._last_cleanup < 86_400:
            return
        self._last_cleanup = now
        commands, events = await self._database.cleanup_retention()
        logger.info(
            "retention cleanup completed",
            extra={"commands_deleted": commands, "events_deleted": events},
        )
