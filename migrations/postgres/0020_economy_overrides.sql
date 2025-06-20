-- 0020_economy_overrides.sql
-- Adds economy_config_overrides table to persist admin-defined overrides to the canonical economy configuration.

CREATE TABLE IF NOT EXISTS economy_config_overrides (
    id SERIAL PRIMARY KEY,
    config JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
); 