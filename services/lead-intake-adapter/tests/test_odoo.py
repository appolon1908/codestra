from __future__ import annotations

import json
from copy import deepcopy

import httpx
import pytest
import respx

from app.models import LeadCommand
from app.odoo import CampaignNotAllowedError, OdooClient


@pytest.mark.asyncio
@respx.mock
async def test_existing_external_lead_is_reconciled_without_create(
    settings,
    lead_command: LeadCommand,
) -> None:
    search_route = respx.post(
        "https://odoo.example.test/json/2/crm.lead/search_read"
    ).mock(return_value=httpx.Response(200, json=[{"id": 42}]))
    create_route = respx.post(
        "https://odoo.example.test/json/2/crm.lead/create"
    ).mock(return_value=httpx.Response(200, json=[43]))

    async with httpx.AsyncClient() as http_client:
        result = await OdooClient(settings, http_client).create_or_find_lead(lead_command)

    assert result.lead_id == 42
    assert result.duplicate is True
    assert search_route.called
    assert not create_route.called


@pytest.mark.asyncio
@respx.mock
async def test_new_lead_uses_allowlisted_campaign_and_external_id(
    settings,
    lead_command: LeadCommand,
) -> None:
    respx.post("https://odoo.example.test/json/2/crm.lead/search_read").mock(
        return_value=httpx.Response(200, json=[])
    )
    create_route = respx.post(
        "https://odoo.example.test/json/2/crm.lead/create"
    ).mock(return_value=httpx.Response(200, json=[77]))

    async with httpx.AsyncClient() as http_client:
        result = await OdooClient(settings, http_client).create_or_find_lead(lead_command)

    assert result.lead_id == 77
    assert result.duplicate is False
    request = create_route.calls.last.request
    body = json.loads(request.content)
    values = body["vals_list"][0]
    assert values["campaign_id"] == 17
    assert values["source_id"] == 9
    assert values["x_codestra_external_lead_id"] == str(lead_command.leadId)
    assert values["email_from"] == "ada@example.com"
    assert request.headers["x-odoo-database"] == "codestra-test"
    assert request.headers["authorization"] == "bearer test-api-key"


@pytest.mark.asyncio
@respx.mock
async def test_unmapped_campaign_never_reaches_odoo_create(
    settings,
    command_payload: dict[str, object],
) -> None:
    payload = deepcopy(command_payload)
    payload["campaign"]["code"] = "UNMAPPED-CAMPAIGN"  # type: ignore[index]
    command = LeadCommand.model_validate(payload)
    respx.post("https://odoo.example.test/json/2/crm.lead/search_read").mock(
        return_value=httpx.Response(200, json=[])
    )
    create_route = respx.post(
        "https://odoo.example.test/json/2/crm.lead/create"
    ).mock(return_value=httpx.Response(200, json=[77]))

    async with httpx.AsyncClient() as http_client:
        with pytest.raises(CampaignNotAllowedError):
            await OdooClient(settings, http_client).create_or_find_lead(command)

    assert not create_route.called
