from __future__ import annotations

import html
from dataclasses import dataclass
from typing import Any
from uuid import UUID

import httpx

from .config import Settings
from .models import LeadCommand


class CampaignNotAllowedError(ValueError):
    pass


class OdooUnavailableError(RuntimeError):
    pass


class OdooContractError(RuntimeError):
    pass


@dataclass(frozen=True, slots=True)
class OdooLeadResult:
    lead_id: int
    duplicate: bool


class OdooClient:
    def __init__(self, settings: Settings, client: httpx.AsyncClient) -> None:
        self._settings = settings
        self._client = client

    def _headers(self) -> dict[str, str]:
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"bearer {self._settings.ODOO_API_KEY}",
            "X-Odoo-Database": self._settings.ODOO_DATABASE,
            "User-Agent": "codestra-lead-intake-adapter/1.0",
        }

    async def _call(self, model: str, method: str, payload: dict[str, Any]) -> Any:
        url = f"{str(self._settings.ODOO_BASE_URL).rstrip('/')}/json/2/{model}/{method}"
        try:
            response = await self._client.post(
                url,
                headers=self._headers(),
                json=payload,
                timeout=self._settings.ODOO_REQUEST_TIMEOUT_SECONDS,
            )
        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            raise OdooUnavailableError("Odoo did not respond to the private adapter") from exc

        if response.status_code >= 500:
            raise OdooUnavailableError(f"Odoo returned upstream status {response.status_code}")
        if response.status_code >= 400:
            raise OdooContractError(
                f"Odoo rejected the adapter contract with status {response.status_code}"
            )

        try:
            return response.json()
        except ValueError as exc:
            raise OdooContractError("Odoo returned a non-JSON response") from exc

    async def find_by_external_lead_id(self, lead_id: UUID) -> int | None:
        result = await self._call(
            "crm.lead",
            "search_read",
            {
                "domain": [[self._settings.ODOO_EXTERNAL_ID_FIELD, "=", str(lead_id)]],
                "fields": ["id"],
                "limit": 1,
            },
        )
        if not isinstance(result, list):
            raise OdooContractError("Odoo crm.lead search_read returned an unexpected shape")
        if not result:
            return None
        first = result[0]
        if not isinstance(first, dict) or not isinstance(first.get("id"), int):
            raise OdooContractError("Odoo crm.lead search_read did not return an integer ID")
        return first["id"]

    def _campaign_id(self, code: str) -> int:
        campaign_id = self._settings.campaign_map.get(code)
        if campaign_id is None:
            raise CampaignNotAllowedError(f"Campaign code {code!r} is not allowlisted")
        return campaign_id

    def _description(self, command: LeadCommand) -> str:
        qualification = command.qualification
        attribution = command.attribution
        rows = [
            ("Service", qualification.service),
            ("Industry", qualification.industry or "Not supplied"),
            ("Budget", qualification.budget or "Not supplied"),
            ("Timeline", qualification.timeline or "Not supplied"),
            ("Company size", command.company.companySize or "Not supplied"),
            ("Landing path", attribution.landingPath),
            ("Referrer", attribution.referrer or "Direct or unavailable"),
            ("UTM source", attribution.utmSource or "Not supplied"),
            ("UTM medium", attribution.utmMedium or "Not supplied"),
            ("UTM campaign", attribution.utmCampaign or "Not supplied"),
            ("Click ID", attribution.clickId or "Not supplied"),
            ("Marketing opt-in", "Yes" if command.consent.marketingOptIn else "No"),
            ("Privacy policy version", command.consent.policyVersion),
            ("Submitted at", command.submittedAt.isoformat()),
            ("Codestra lead ID", str(command.leadId)),
        ]
        table = "".join(
            f"<tr><th style='text-align:left;padding-right:12px'>{html.escape(label)}</th>"
            f"<td>{html.escape(value)}</td></tr>"
            for label, value in rows
        )
        return (
            "<h3>Website project request</h3>"
            f"<p>{html.escape(qualification.message).replace(chr(10), '<br>')}</p>"
            f"<table>{table}</table>"
        )

    def _lead_values(self, command: LeadCommand) -> dict[str, Any]:
        source_id = self._settings.source_map.get("website")
        values: dict[str, Any] = {
            "name": f"Codestra website — {command.qualification.service} — {command.company.name}",
            "type": "lead",
            "contact_name": command.contact.fullName,
            "email_from": str(command.contact.workEmail),
            "phone": command.contact.phone or False,
            "partner_name": command.company.name,
            "function": command.company.jobTitle or False,
            "description": self._description(command),
            "campaign_id": self._campaign_id(command.campaign.code),
            self._settings.ODOO_EXTERNAL_ID_FIELD: str(command.leadId),
        }
        if source_id is not None:
            values["source_id"] = source_id
        return values

    @staticmethod
    def _created_id(result: Any) -> int:
        if isinstance(result, bool):
            raise OdooContractError("Odoo crm.lead create returned a boolean")
        if isinstance(result, int):
            return result
        if isinstance(result, list) and len(result) == 1 and isinstance(result[0], int):
            return result[0]
        if isinstance(result, dict):
            candidate = result.get("id")
            if isinstance(candidate, int) and not isinstance(candidate, bool):
                return candidate
            ids = result.get("ids")
            if isinstance(ids, list) and len(ids) == 1 and isinstance(ids[0], int):
                return ids[0]
        raise OdooContractError("Odoo crm.lead create returned an unexpected shape")

    async def create_or_find_lead(self, command: LeadCommand) -> OdooLeadResult:
        existing_id = await self.find_by_external_lead_id(command.leadId)
        if existing_id is not None:
            return OdooLeadResult(lead_id=existing_id, duplicate=True)

        result = await self._call(
            "crm.lead",
            "create",
            {"vals_list": [self._lead_values(command)]},
        )
        return OdooLeadResult(lead_id=self._created_id(result), duplicate=False)
