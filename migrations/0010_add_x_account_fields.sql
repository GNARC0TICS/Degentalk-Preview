-- Migration to add X (Twitter) integration fields to users table
ALTER TABLE users
ADD COLUMN x_account_id VARCHAR(255),
ADD COLUMN x_access_token TEXT,
ADD COLUMN x_refresh_token TEXT,
ADD COLUMN x_token_expires_at TIMESTAMP,
ADD COLUMN x_linked_at TIMESTAMP;

-- Optional: ensure a user can link only one X account
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_x_account_id ON users (x_account_id); 