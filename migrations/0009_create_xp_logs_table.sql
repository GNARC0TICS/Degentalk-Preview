-- Migration to create xp_logs table for tracking daily XP gains
CREATE TABLE IF NOT EXISTS xp_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    xp_gained INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_xp_logs_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT xp_logs_user_date_unique UNIQUE (user_id, date)
);

-- Create index for efficient range queries
CREATE INDEX idx_xp_logs_user_date ON xp_logs (user_id, date);
