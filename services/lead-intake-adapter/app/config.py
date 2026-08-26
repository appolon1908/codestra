from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from pydantic import Field, HttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=None,
        case_sensitive=True,
        extra="ignore",
    )

    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: str
    PUBLIC_ORIGINS: str = "https://codestra.co,https://www.codestra.co"
    TRUST_PROXY_HEADERS: bool = True

    ODOO_WRITE_ENABLED: bool = False
    N8N_DELIVERY_ENABLED: bool = False

    ODOO_BASE_URL: HttpUrl
    ODOO_DATABASE: str = Field(min_length=1, max_length=128)
    ODOO_API_KEY: str = Field(min_length=1)
    ODOO_EXTERNAL_ID_FIELD: str = Field(
        default="x_codestra_external_lead_id",
        pattern=r"^[a-z][a-z0-9_]{2,127}$",
    )
    ODOO_CAMPAIGN_MAP_JSON: str = "{}"
    ODOO_SOURCE_MAP_JSON: str = '{"website": 1}'
    ODOO_REQUEST_TIMEOUT_SECONDS: float = Field(default=12, gt=0, le=60)

    TURNSTILE_SECRET_KEY: str = ""
    TURNSTILE_EXPECTED_HOSTNAMES: str = "codestra.co,www.codestra.co"
    TURNSTILE_REQUIRED: bool = True
    MINIMUM_FORM_DWELL_MS: int = Field(default=1500, ge=0, le=120000)

    N8N_WEBHOOK_URL: HttpUrl | None = None
    N8N_SIGNING_SECRET: str = ""
    N8N_REQUEST_TIMEOUT_SECONDS: float = Field(default=10, gt=0, le=60)
    N8N_OUTBOX_POLL_SECONDS: float = Field(default=2, ge=0.25, le=60)
    N8N_OUTBOX_MAX_ATTEMPTS: int = Field(default=12, ge=1, le=100)

    IDEMPOTENCY_LEASE_SECONDS: int = Field(default=45, ge=10, le=600)
    COMMAND_RETENTION_DAYS: int = Field(default=365, ge=30, le=3650)
    OUTBOX_RETENTION_DAYS: int = Field(default=90, ge=7, le=3650)

    @field_validator("LOG_LEVEL")
    @classmethod
    def normalize_log_level(cls, value: str) -> str:
        normalized = value.upper().strip()
        if normalized not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ValueError("LOG_LEVEL is not supported")
        return normalized

    @field_validator("ODOO_BASE_URL")
    @classmethod
    def normalize_odoo_url(cls, value: HttpUrl) -> HttpUrl:
        return HttpUrl(str(value).rstrip("/"))

    @model_validator(mode="after")
    def validate_activation_dependencies(self) -> Settings:
        if self.TURNSTILE_REQUIRED and not self.TURNSTILE_SECRET_KEY:
            raise ValueError("TURNSTILE_SECRET_KEY is required while TURNSTILE_REQUIRED=true")
        if self.N8N_DELIVERY_ENABLED and not self.N8N_WEBHOOK_URL:
            raise ValueError("N8N_WEBHOOK_URL is required while N8N_DELIVERY_ENABLED=true")
        if self.N8N_DELIVERY_ENABLED and len(self.N8N_SIGNING_SECRET) < 32:
            raise ValueError("N8N_SIGNING_SECRET must contain at least 32 characters")
        return self

    @property
    def public_origins(self) -> frozenset[str]:
        return frozenset(item.strip().rstrip("/") for item in self.PUBLIC_ORIGINS.split(",") if item.strip())

    @property
    def turnstile_expected_hostnames(self) -> frozenset[str]:
        return frozenset(item.strip().lower() for item in self.TURNSTILE_EXPECTED_HOSTNAMES.split(",") if item.strip())

    @staticmethod
    def _positive_integer_map(raw: str, variable_name: str) -> dict[str, int]:
        try:
            parsed: Any = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{variable_name} must be valid JSON") from exc
        if not isinstance(parsed, dict):
            raise ValueError(f"{variable_name} must be a JSON object")

        result: dict[str, int] = {}
        for key, value in parsed.items():
            if not isinstance(key, str) or not key.strip():
                raise ValueError(f"{variable_name} keys must be non-empty strings")
            if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
                raise ValueError(f"{variable_name} values must be positive integer Odoo IDs")
            result[key.strip()] = value
        return result

    @property
    def campaign_map(self) -> dict[str, int]:
        return self._positive_integer_map(self.ODOO_CAMPAIGN_MAP_JSON, "ODOO_CAMPAIGN_MAP_JSON")

    @property
    def source_map(self) -> dict[str, int]:
        return self._positive_integer_map(self.ODOO_SOURCE_MAP_JSON, "ODOO_SOURCE_MAP_JSON")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
