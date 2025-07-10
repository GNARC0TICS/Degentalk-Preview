-- Enhanced Profile System Migration
-- Add profile enhancement fields to users table

-- Add new profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS dgt_balance BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_posts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_threads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tips INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_level_xp INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS friend_requests_sent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS friend_requests_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update wallet_pending_withdrawals to be BIGINT instead of JSONB
ALTER TABLE users 
DROP COLUMN IF EXISTS wallet_pending_withdrawals;

ALTER TABLE users 
ADD COLUMN wallet_pending_withdrawals BIGINT DEFAULT 0;

-- Add new columns to user_relationships for enhanced functionality
ALTER TABLE user_relationships 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'follow',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create profile analytics table
CREATE TABLE IF NOT EXISTS profile_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    session_duration INTEGER NOT NULL,
    tab_switches INTEGER DEFAULT 0,
    actions_performed INTEGER DEFAULT 0,
    scroll_depth DECIMAL(3,2) DEFAULT 0.00,
    engagement_score INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation) WHERE reputation > 0;
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level) WHERE level > 1;
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at) WHERE last_seen_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_relationships_user_type ON user_relationships(user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_relationships_target_type ON user_relationships(target_user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_relationships_status ON user_relationships(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_user ON profile_analytics(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_viewer ON profile_analytics(viewer_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_created ON profile_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_engagement ON profile_analytics(engagement_score);

-- Update table statistics for query planner
ANALYZE users;
ANALYZE user_relationships;
ANALYZE profile_analytics;