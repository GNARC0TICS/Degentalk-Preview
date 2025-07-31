-- Create user_session table for Lucia Auth (note: singular 'session' to match Drizzle schema)
CREATE TABLE IF NOT EXISTS user_session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Additional session metadata
    ip_address INET,
    user_agent TEXT,
    device_id TEXT,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_session(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_session(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_id ON user_session(device_id);

-- Create index for session cleanup
-- Note: Removed partial index as CURRENT_TIMESTAMP is not immutable

-- Add comment to table
COMMENT ON TABLE user_session IS 'Lucia Auth session storage';
COMMENT ON COLUMN user_session.id IS 'Unique session identifier';
COMMENT ON COLUMN user_session.user_id IS 'Reference to the user who owns this session';
COMMENT ON COLUMN user_session.expires_at IS 'When this session expires';
COMMENT ON COLUMN user_session.ip_address IS 'IP address from which session was created';
COMMENT ON COLUMN user_session.user_agent IS 'User agent string of the client';
COMMENT ON COLUMN user_session.device_id IS 'Generated device identifier for session tracking';
COMMENT ON COLUMN user_session.last_active_at IS 'Last time this session was active';