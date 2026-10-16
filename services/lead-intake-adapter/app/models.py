from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Campaign(StrictModel):
    code: str = Field(pattern=r"^[A-Z0-9][A-Z0-9_-]{2,63}$")


class Contact(StrictModel):
    fullName: str = Field(min_length=2, max_length=160)
    workEmail: EmailStr
    phone: str = Field(default="", max_length=40)


class Company(StrictModel):
    name: str = Field(min_length=2, max_length=200)
    jobTitle: str = Field(default="", max_length=160)
    companySize: str = Field(default="", max_length=40)


class Qualification(StrictModel):
    service: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    industry: str = Field(default="", max_length=100, pattern=r"^[a-z0-9-]*$")
    budget: str = Field(default="", max_length=60, pattern=r"^[a-z0-9+_-]*$")
    timeline: str = Field(default="", max_length=60, pattern=r"^[a-z0-9-]*$")
    message: str = Field(min_length=20, max_length=5000)


class Consent(StrictModel):
    privacyAccepted: Literal[True]
    marketingOptIn: bool
    policyVersion: str = Field(min_length=1, max_length=40)


class Attribution(StrictModel):
    landingPath: str = Field(max_length=2048)
    referrer: str = Field(default="", max_length=2048)
    utmSource: str = Field(default="", max_length=200)
    utmMedium: str = Field(default="", max_length=200)
    utmCampaign: str = Field(default="", max_length=200)
    utmTerm: str = Field(default="", max_length=200)
    utmContent: str = Field(default="", max_length=200)
    clickId: str = Field(default="", max_length=512)

    @field_validator("landingPath")
    @classmethod
    def require_local_landing_path(cls, value: str) -> str:
        if not value.startswith("/") or value.startswith("//"):
            raise ValueError("landingPath must be root-relative")
        return value


class AntiAbuse(StrictModel):
    turnstileToken: str = Field(default="", max_length=4096)
    honeypot: str = Field(default="", max_length=0)
    dwellMs: int = Field(ge=0, le=86_400_000)


class LeadCommand(StrictModel):
    schemaVersion: Literal["1.0"]
    leadId: UUID
    submittedAt: datetime
    campaign: Campaign
    contact: Contact
    company: Company
    qualification: Qualification
    consent: Consent
    attribution: Attribution
    antiAbuse: AntiAbuse

    @model_validator(mode="after")
    def validate_submission_time(self) -> LeadCommand:
        submitted = self.submittedAt
        if submitted.tzinfo is None:
            raise ValueError("submittedAt must include a timezone")
        now = datetime.now(UTC)
        normalized = submitted.astimezone(UTC)
        if normalized > now + timedelta(minutes=10):
            raise ValueError("submittedAt is too far in the future")
        if normalized < now - timedelta(days=2):
            raise ValueError("submittedAt is too old")
        return self

    def semantic_payload(self) -> dict[str, object]:
        payload = self.model_dump(mode="json")
        payload["antiAbuse"] = {"honeypot": ""}
        return payload

    def stored_payload(self) -> dict[str, object]:
        payload = self.model_dump(mode="json")
        payload["antiAbuse"] = {
            "dwellMs": self.antiAbuse.dwellMs,
            "turnstileVerified": bool(self.antiAbuse.turnstileToken),
        }
        return payload


class LeadReceipt(StrictModel):
    leadId: UUID
    status: Literal["accepted", "duplicate"]
    message: str
    correlationId: str | None = None


class Problem(StrictModel):
    code: str
    message: str
    correlationId: str | None = None
