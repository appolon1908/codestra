BEGIN;

CREATE TABLE IF NOT EXISTS lead_intake_commands (
    lead_id UUID PRIMARY KEY,
    idempotency_key UUID NOT NULL UNIQUE,
    request_hash CHAR(64) NOT NULL,
    schema_version VARCHAR(16) NOT NULL,
    status VARCHAR(24) NOT NULL CHECK (status IN ('processing', 'accepted', 'failed')),
    payload JSONB NOT NULL,
    correlation_id VARCHAR(160) NOT NULL,
    odoo_lead_id BIGINT,
    attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts > 0),
    lease_expires_at TIMESTAMPTZ,
    last_error_code VARCHAR(100),
    last_error_message VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS lead_intake_commands_status_lease_idx
    ON lead_intake_commands (status, lease_expires_at);

CREATE INDEX IF NOT EXISTS lead_intake_commands_created_at_idx
    ON lead_intake_commands (created_at);

CREATE TABLE IF NOT EXISTS lead_outbox (
    event_id UUID PRIMARY KEY,
    aggregate_id UUID NOT NULL REFERENCES lead_intake_commands (lead_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_version INTEGER NOT NULL CHECK (event_version > 0),
    payload JSONB NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'delivering', 'delivered', 'dead')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lease_expires_at TIMESTAMPTZ,
    last_error VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    UNIQUE (aggregate_id, event_type, event_version)
);

CREATE INDEX IF NOT EXISTS lead_outbox_delivery_idx
    ON lead_outbox (status, available_at, lease_expires_at);

CREATE INDEX IF NOT EXISTS lead_outbox_created_at_idx
    ON lead_outbox (created_at);

COMMIT;
