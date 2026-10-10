from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.config import Settings

BASE_SETTINGS = {
    "DATABASE_URL": "postgresql://postgres:postgres@127.0.0.1:5432/codestra",
    "ODOO_BASE_URL": "https://odoo.example.test",
    "ODOO_DATABASE": "codestra",
    "TURNSTILE_REQUIRED": False,
    "ODOO_CAMPAIGN_MAP_JSON": '{"CODESTRA-WEB-AI": 17}',
    "ODOO_SOURCE_MAP_JSON": '{"website": 9}',
}


def test_safe_mode_does_not_require_live_odoo_credentials() -> None:
    settings = Settings(
        **BASE_SETTINGS,
        ODOO_WRITE_ENABLED=False,
        ODOO_API_KEY="",
    )

    assert settings.ODOO_WRITE_ENABLED is False
    assert settings.ODOO_API_KEY == ""


def test_live_write_requires_odoo_api_key() -> None:
    with pytest.raises(ValidationError, match="ODOO_API_KEY"):
        Settings(
            **BASE_SETTINGS,
            ODOO_WRITE_ENABLED=True,
            ODOO_API_KEY="",
        )


def test_live_write_requires_an_allowlisted_campaign() -> None:
    values = dict(BASE_SETTINGS)
    values["ODOO_CAMPAIGN_MAP_JSON"] = "{}"

    with pytest.raises(ValidationError, match="campaign"):
        Settings(
            **values,
            ODOO_WRITE_ENABLED=True,
            ODOO_API_KEY="test-key",
        )


def test_invalid_odoo_map_is_rejected_at_startup() -> None:
    values = dict(BASE_SETTINGS)
    values["ODOO_SOURCE_MAP_JSON"] = '{"website": true}'

    with pytest.raises(ValidationError, match="positive integer"):
        Settings(
            **values,
            ODOO_WRITE_ENABLED=False,
        )
