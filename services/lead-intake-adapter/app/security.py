from __future__ import annotations

from dataclasses import dataclass

import httpx
from fastapi import Request

from .config import Settings
from .models import LeadCommand


class AntiAbuseRejectedError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class TurnstileVerification:
    hostname: str
    action: str


def client_ip(request: Request, settings: Settings) -> str:
    if settings.TRUST_PROXY_HEADERS:
        forwarded = request.headers.get("x-forwarded-for", "")
        first = forwarded.split(",", 1)[0].strip()
        if first:
            return first[:64]
        real_ip = request.headers.get("x-real-ip", "").strip()
        if real_ip:
            return real_ip[:64]
    return request.client.host[:64] if request.client else ""


def validate_origin(request: Request, settings: Settings) -> None:
    origin = request.headers.get("origin", "").strip().rstrip("/")
    if origin and origin not in settings.public_origins:
        raise AntiAbuseRejectedError("The request origin is not allowed")


async def verify_turnstile(
    command: LeadCommand,
    request: Request,
    settings: Settings,
    client: httpx.AsyncClient,
) -> TurnstileVerification | None:
    validate_origin(request, settings)

    if command.antiAbuse.honeypot:
        raise AntiAbuseRejectedError("Automated submission rejected")
    if command.antiAbuse.dwellMs < settings.MINIMUM_FORM_DWELL_MS:
        raise AntiAbuseRejectedError("The form was submitted too quickly")

    token = command.antiAbuse.turnstileToken.strip()
    if not settings.TURNSTILE_REQUIRED:
        return None
    if not token:
        raise AntiAbuseRejectedError("The anti-abuse challenge is required")

    try:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": settings.TURNSTILE_SECRET_KEY,
                "response": token,
                "remoteip": client_ip(request, settings),
                "idempotency_key": str(command.leadId),
            },
            headers={"Accept": "application/json"},
            timeout=8,
        )
    except (httpx.TimeoutException, httpx.NetworkError) as exc:
        raise AntiAbuseRejectedError("The anti-abuse service could not be verified") from exc

    if response.status_code >= 500:
        raise AntiAbuseRejectedError("The anti-abuse service is temporarily unavailable")
    try:
        result = response.json()
    except ValueError as exc:
        raise AntiAbuseRejectedError("The anti-abuse service returned an invalid response") from exc

    if not isinstance(result, dict) or result.get("success") is not True:
        raise AntiAbuseRejectedError("The anti-abuse challenge was not accepted")

    hostname = str(result.get("hostname") or "").lower()
    if (
        settings.turnstile_expected_hostnames
        and hostname not in settings.turnstile_expected_hostnames
    ):
        raise AntiAbuseRejectedError("The anti-abuse challenge hostname did not match")

    if result.get("action") != "consultation":
        raise AntiAbuseRejectedError("The anti-abuse challenge action did not match")

    return TurnstileVerification(
        hostname=hostname,
        action=str(result.get("action") or ""),
    )
