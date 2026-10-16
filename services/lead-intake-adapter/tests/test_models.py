from __future__ import annotations

from copy import deepcopy

import pytest
from pydantic import ValidationError

from app.database import Database
from app.models import LeadCommand


def test_valid_command_is_accepted(command_payload: dict[str, object]) -> None:
    command = LeadCommand.model_validate(command_payload)
    assert command.schemaVersion == "1.0"
    assert command.contact.workEmail == "ada@example.com"


def test_unknown_fields_are_rejected(command_payload: dict[str, object]) -> None:
    payload = deepcopy(command_payload)
    payload["internalOdooCampaignId"] = 17

    with pytest.raises(ValidationError):
        LeadCommand.model_validate(payload)


def test_privacy_acceptance_is_required(command_payload: dict[str, object]) -> None:
    payload = deepcopy(command_payload)
    payload["consent"]["privacyAccepted"] = False  # type: ignore[index]

    with pytest.raises(ValidationError):
        LeadCommand.model_validate(payload)


def test_landing_path_must_be_local(command_payload: dict[str, object]) -> None:
    payload = deepcopy(command_payload)
    payload["attribution"]["landingPath"] = "https://attacker.example/path"  # type: ignore[index]

    with pytest.raises(ValidationError):
        LeadCommand.model_validate(payload)


def test_semantic_hash_ignores_one_time_turnstile_evidence(
    command_payload: dict[str, object],
) -> None:
    first = LeadCommand.model_validate(command_payload)
    retry_payload = deepcopy(command_payload)
    retry_payload["antiAbuse"]["turnstileToken"] = "a-new-single-use-token"  # type: ignore[index]
    retry_payload["antiAbuse"]["dwellMs"] = 15000  # type: ignore[index]
    retry = LeadCommand.model_validate(retry_payload)

    assert Database.request_hash(first) == Database.request_hash(retry)


def test_semantic_hash_changes_when_business_request_changes(
    command_payload: dict[str, object],
) -> None:
    first = LeadCommand.model_validate(command_payload)
    changed_payload = deepcopy(command_payload)
    changed_payload["qualification"]["message"] = (  # type: ignore[index]
        "We need a different workflow and a materially different project request."
    )
    changed = LeadCommand.model_validate(changed_payload)

    assert Database.request_hash(first) != Database.request_hash(changed)
