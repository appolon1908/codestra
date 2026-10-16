from __future__ import annotations

import logging
import sys
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import Annotated
from uuid import UUID, uuid4

import httpx
from fastapi import FastAPI, Header, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pythonjsonlogger.json import JsonFormatter

from .config import Settings, get_settings
from .database import Database, IdempotencyConflictError
from .models import LeadCommand, LeadReceipt, Problem
from .odoo import (
    CampaignNotAllowedError,
    OdooClient,
    OdooContractError,
    OdooUnavailableError,
)
from .outbox import OutboxWorker
from .security import AntiAbuseRejectedError, verify_turnstile

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class Runtime:
    settings: Settings
    database: Database
    http_client: httpx.AsyncClient
    odoo: OdooClient
    outbox: OutboxWorker


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s %(correlation_id)s",
            rename_fields={"levelname": "level", "asctime": "timestamp"},
        )
    )
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)


def problem_response(
    status_code: int,
    code: str,
    message: str,
    correlation_id: str,
    *,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    payload = Problem(code=code, message=message, correlationId=correlation_id)
    response_headers = {"X-Correlation-ID": correlation_id, **(headers or {})}
    return JSONResponse(
        status_code=status_code,
        content=payload.model_dump(mode="json", exclude_none=True),
        media_type="application/problem+json",
        headers=response_headers,
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    configure_logging(settings.LOG_LEVEL)
    database = Database(settings)
    await database.connect()
    http_client = httpx.AsyncClient(
        follow_redirects=False,
        limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
    )
    odoo = OdooClient(settings, http_client)
    outbox = OutboxWorker(settings, database, http_client)
    runtime = Runtime(
        settings=settings,
        database=database,
        http_client=http_client,
        odoo=odoo,
        outbox=outbox,
    )
    app.state.runtime = runtime
    outbox.start()
    logger.info(
        "lead adapter started",
        extra={
            "environment": settings.APP_ENV,
            "odoo_write_enabled": settings.ODOO_WRITE_ENABLED,
            "n8n_delivery_enabled": settings.N8N_DELIVERY_ENABLED,
        },
    )
    try:
        yield
    finally:
        await outbox.stop()
        await http_client.aclose()
        await database.close()
        logger.info("lead adapter stopped")


app = FastAPI(
    title="Codestra Lead Intake Adapter",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    lifespan=lifespan,
)


@app.middleware("http")
async def request_controls(request: Request, call_next):  # type: ignore[no-untyped-def]
    correlation_id = request.headers.get("x-correlation-id", "").strip()[:160] or str(uuid4())
    request.state.correlation_id = correlation_id
    started = time.perf_counter()

    if request.method == "POST":
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > 131_072:
                    return problem_response(
                        413,
                        "PAYLOAD_TOO_LARGE",
                        "The lead request exceeded the maximum payload size.",
                        correlation_id,
                    )
            except ValueError:
                return problem_response(
                    400,
                    "INVALID_CONTENT_LENGTH",
                    "The request Content-Length header was invalid.",
                    correlation_id,
                )

    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    logger.info(
        "request completed",
        extra={
            "correlation_id": correlation_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
        },
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    correlation_id = getattr(request.state, "correlation_id", str(uuid4()))
    fields = sorted(
        {
            ".".join(str(part) for part in error.get("loc", ()) if part != "body")
            for error in exc.errors()
        }
    )
    logger.warning(
        "lead command validation failed",
        extra={"correlation_id": correlation_id, "fields": fields},
    )
    return problem_response(
        422,
        "VALIDATION_FAILED",
        "Review the required fields and submit the request again.",
        correlation_id,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    correlation_id = getattr(request.state, "correlation_id", str(uuid4()))
    logger.exception(
        "unhandled adapter error",
        extra={"correlation_id": correlation_id, "error_type": type(exc).__name__},
    )
    return problem_response(
        500,
        "INTERNAL_ERROR",
        "The lead request could not be completed.",
        correlation_id,
    )


@app.get("/health/live", include_in_schema=False)
async def health_live() -> dict[str, str]:
    return {"status": "live"}


@app.get("/health/ready", include_in_schema=False)
async def health_ready(request: Request) -> JSONResponse:
    runtime: Runtime = request.app.state.runtime
    database_ready = await runtime.database.ping()
    campaign_map_ready = bool(runtime.settings.campaign_map)
    turnstile_ready = not runtime.settings.TURNSTILE_REQUIRED or bool(
        runtime.settings.TURNSTILE_SECRET_KEY
    )
    ready = all(
        [
            database_ready,
            campaign_map_ready,
            turnstile_ready,
            runtime.settings.ODOO_WRITE_ENABLED,
        ]
    )
    return JSONResponse(
        status_code=200 if ready else 503,
        content={
            "status": "ready" if ready else "not_ready",
            "checks": {
                "database": database_ready,
                "campaignMap": campaign_map_ready,
                "turnstile": turnstile_ready,
                "odooWriteEnabled": runtime.settings.ODOO_WRITE_ENABLED,
                "n8nDeliveryEnabled": runtime.settings.N8N_DELIVERY_ENABLED,
            },
        },
        headers={"Cache-Control": "no-store"},
    )


@app.post(
    "/api/leads/v1/consultations",
    response_model=LeadReceipt,
    status_code=202,
)
async def create_consultation_lead(
    request: Request,
    command: LeadCommand,
    idempotency_key: Annotated[UUID, Header(alias="Idempotency-Key")],
    form_version: Annotated[str, Header(alias="X-Codestra-Form-Version")],
) -> JSONResponse:
    runtime: Runtime = request.app.state.runtime
    correlation_id = request.state.correlation_id

    if form_version != command.schemaVersion:
        return problem_response(
            400,
            "FORM_VERSION_MISMATCH",
            "The form version did not match the submitted command.",
            correlation_id,
        )
    if idempotency_key != command.leadId:
        return problem_response(
            400,
            "IDEMPOTENCY_KEY_MISMATCH",
            "Idempotency-Key must match the leadId in the command.",
            correlation_id,
        )
    if not runtime.settings.ODOO_WRITE_ENABLED:
        return problem_response(
            503,
            "LIVE_WRITE_DISABLED",
            "Lead intake is not activated for CRM writes.",
            correlation_id,
            headers={"Retry-After": "300"},
        )

    try:
        await verify_turnstile(
            command,
            request,
            runtime.settings,
            runtime.http_client,
        )
    except AntiAbuseRejectedError as exc:
        logger.warning(
            "anti-abuse validation rejected submission",
            extra={"correlation_id": correlation_id, "reason": str(exc)},
        )
        return problem_response(
            400,
            "ANTI_ABUSE_REJECTED",
            "The anti-abuse validation could not be completed.",
            correlation_id,
        )

    try:
        claim = await runtime.database.claim_command(command, idempotency_key, correlation_id)
    except IdempotencyConflictError:
        return problem_response(
            409,
            "IDEMPOTENCY_CONFLICT",
            "The idempotency key was already used for a different request.",
            correlation_id,
        )

    if claim.state == "duplicate":
        receipt = LeadReceipt(
            leadId=command.leadId,
            status="duplicate",
            message="This request was already received.",
            correlationId=correlation_id,
        )
        return JSONResponse(
            status_code=200,
            content=receipt.model_dump(mode="json", exclude_none=True),
            headers={"X-Correlation-ID": correlation_id},
        )

    if claim.state == "processing":
        response = problem_response(
            409,
            "REQUEST_IN_PROGRESS",
            "This request is already being processed. Retry after five seconds.",
            correlation_id,
        )
        response.headers["Retry-After"] = "5"
        return response

    try:
        odoo_result = await runtime.odoo.create_or_find_lead(command)
        await runtime.database.mark_accepted(
            command,
            odoo_result.lead_id,
            correlation_id,
        )
    except CampaignNotAllowedError:
        await runtime.database.mark_failed(
            command.leadId,
            "CAMPAIGN_NOT_ALLOWED",
            "The public campaign code is not allowlisted.",
        )
        return problem_response(
            422,
            "CAMPAIGN_NOT_ALLOWED",
            "The selected campaign is not available.",
            correlation_id,
        )
    except OdooUnavailableError:
        await runtime.database.mark_failed(
            command.leadId,
            "ODOO_UNAVAILABLE",
            "Odoo did not respond.",
        )
        return problem_response(
            503,
            "CRM_UNAVAILABLE",
            "The CRM is temporarily unavailable. Please retry using the same request.",
            correlation_id,
            headers={"Retry-After": "30"},
        )
    except OdooContractError:
        await runtime.database.mark_failed(
            command.leadId,
            "ODOO_CONTRACT_ERROR",
            "Odoo rejected the configured mapping.",
        )
        return problem_response(
            503,
            "CRM_MAPPING_UNAVAILABLE",
            "The CRM mapping is not ready to accept this request.",
            correlation_id,
            headers={"Retry-After": "300"},
        )

    receipt = LeadReceipt(
        leadId=command.leadId,
        status="duplicate" if odoo_result.duplicate else "accepted",
        message=(
            "This request was already received."
            if odoo_result.duplicate
            else "Your request has been received. A Codestra specialist will follow up."
        ),
        correlationId=correlation_id,
    )
    return JSONResponse(
        status_code=200 if odoo_result.duplicate else 202,
        content=receipt.model_dump(mode="json", exclude_none=True),
        headers={"X-Correlation-ID": correlation_id},
    )
