-- Fix wallet balance columns type mismatch
-- Converts existing double precision/numeric values to bigint explicitly
-- Safe because fractional parts will be truncated (balances are stored in satoshis / wei style units)

BEGIN;

ALTER TABLE users
  ALTER COLUMN wallet_balance_usdt
    TYPE bigint
    USING wallet_balance_usdt::bigint;

ALTER TABLE users
  ALTER COLUMN wallet_pending_withdrawals
    TYPE bigint
    USING wallet_pending_withdrawals::bigint;

COMMIT; 