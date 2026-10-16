from __future__ import annotations

import httpx
import pytest
import respx
from fastapi import Request

from app.models import LeadCommand
from app.security import AntiAbuseRejectedError, verify_turnstile


def make_request() -> Request:
    return Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "POST",
            "scheme": "https",
            "path": "/api/leads/v1/consultations",
            "raw_path": b"/api/leads/v1/consultations",
            "query_string": b"",
            "headers": [
                (b"origin", b"https://codestra.co"),
                (b"x-forwarded-for", b"203.0.113.10"),
            ],
            "client": ("10.40.0.1", 44321),
            "server": ("codestra-lead-adapter", 8080),
        }
    )


@pytest.mark.asyncio
@respx.mock
async def test_turnstile_accepts_expected_hostname_and_action(
    settings,
    lead_command: LeadCommand,
) -> None:
    configured = settings.model_copy(
        update={
            "TURNSTILE_REQUIRED": True,
            "TURNSTILE_SECRET_KEY": "test-secret",
        }
    )
    respx.post("https://challenges.cloudflare.com/turnstile/v0/siteverify").mock(
        return_value=httpx.Response(
            200,
            json={
                "success": True,
                "hostname": "codestra.co",
                "action": "consultation",
            },
        )
    )

    async with httpx.AsyncClient() as client:
        result = await verify_turnstile(
            lead_command,
            make_request(),
            configured,
            client,
        )

    assert result is not None
    assert result.hostname == "codestra.co"
    assert result.action == "consultation"


@pytest.mark.asyncio
@respx.mock
async def test_turnstile_rejects_token_for_another_action(
    settings,
    lead_command: LeadCommand,
) -> None:
    configured = settings.model_copy(
        update={
            "TURNSTILE_REQUIRED": True,
            "TURNSTILE_SECRET_KEY": "test-secret",
        }
    )
    respx.post("https://challenges.cloudflare.com/turnstile/v0/siteverify").mock(
        return_value=httpx.Response(
            200,
            json={
                "success": True,
                "hostname": "codestra.co",
                "action": "newsletter",
            },
        )
    )

    async with httpx.AsyncClient() as client:
        with pytest.raises(AntiAbuseRejectedError, match="action"):
            await verify_turnstile(
                lead_command,
                make_request(),
                configured,
                client,
            )
