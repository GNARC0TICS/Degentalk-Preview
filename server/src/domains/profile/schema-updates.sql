-- Schema Updates for Enhanced Profile System
-- Run these migrations to support new profile features

-- 1. Add missing wallet fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_pending_withdrawals DECIMAL(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS dgt_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_level INTEGER DEFAULT 0;

-- 2. Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users (last_seen_at) WHERE last_seen_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users (reputation) WHERE reputation > 0;
CREATE INDEX IF NOT EXISTS idx_users_level ON users (level) WHERE level > 1;

-- 3. Add relationship indexes for social features
CREATE INDEX IF NOT EXISTS idx_user_relationships_user_type ON user_relationships (user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_relationships_target_type ON user_relationships (target_user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_relationships_status ON user_relationships (status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_user_relationships_created ON user_relationships (created_at);

-- 4. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at);

-- 5. Create achievements table for milestone tracking
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon_url VARCHAR(255),
    requirements JSONB NOT NULL DEFAULT '{}',
    reward_xp INTEGER DEFAULT 0,
    reward_dgt DECIMAL(20,8) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create user achievements table for progress tracking
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Add achievement indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements (category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements (rarity);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements (user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements (user_id, is_completed);

-- 7. Create profile analytics table for engagement tracking
CREATE TABLE IF NOT EXISTS profile_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous
    session_duration INTEGER NOT NULL, -- milliseconds
    tab_switches INTEGER DEFAULT 0,
    actions_performed INTEGER DEFAULT 0,
    scroll_depth DECIMAL(3,2) DEFAULT 0, -- 0.0 to 1.0
    engagement_score INTEGER DEFAULT 0, -- 0 to 100
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add analytics indexes
CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_user ON profile_analytics (profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_viewer ON profile_analytics (viewer_user_id) WHERE viewer_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profile_analytics_created ON profile_analytics (created_at);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_engagement ON profile_analytics (engagement_score) WHERE engagement_score > 50;

-- 8. Add updated_at triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON user_achievements;
CREATE TRIGGER update_user_achievements_updated_at
    BEFORE UPDATE ON user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 9. Insert default achievements
INSERT INTO achievements (name, description, category, rarity, requirements, reward_xp, reward_dgt) VALUES
    ('First Steps', 'Made your first post', 'activity', 'common', '{"totalPosts": 1}', 100, 10),
    ('Rising Star', 'Reached level 10', 'progression', 'common', '{"level": 10}', 500, 50),
    ('Active Member', 'Posted 100 times', 'activity', 'rare', '{"totalPosts": 100}', 1000, 100),
    ('Generous Soul', 'Gave $1,000 in tips', 'social', 'epic', '{"totalTips": 1000}', 2000, 200),
    ('Veteran', '1 year member', 'loyalty', 'rare', '{"daysSinceJoined": 365}', 1500, 150),
    ('Elite Member', 'Reached level 50', 'progression', 'epic', '{"level": 50}', 5000, 500),
    ('Referral Master', 'Referred 10 users', 'social', 'legendary', '{"referralsCount": 10}', 10000, 1000)
ON CONFLICT DO NOTHING;

-- 10. Add comments for documentation
COMMENT ON TABLE notifications IS 'User notifications for social actions and system events';
COMMENT ON TABLE achievements IS 'Available achievements users can unlock';
COMMENT ON TABLE user_achievements IS 'User progress and completion status for achievements';
COMMENT ON TABLE profile_analytics IS 'Profile page engagement analytics for optimization';

COMMENT ON COLUMN users.wallet_pending_withdrawals IS 'Amount in pending withdrawal requests';
COMMENT ON COLUMN users.dgt_points IS 'Loyalty points earned through platform engagement';
COMMENT ON COLUMN users.referral_level IS 'User level in referral program';

-- 11. Create view for quick profile stats (used by quick-stats endpoint)
CREATE OR REPLACE VIEW profile_quick_stats AS
SELECT 
    u.id,
    u.username,
    u.avatar_url,
    u.level,
    u.reputation,
    u.last_seen_at,
    CASE 
        WHEN u.last_seen_at > NOW() - INTERVAL '5 minutes' THEN true
        ELSE false
    END as is_online,
    CASE 
        WHEN u.reputation >= 10000 OR u.level >= 50 THEN 'Elite'
        WHEN u.reputation >= 5000 OR u.level >= 25 THEN 'Veteran'
        WHEN u.reputation >= 1000 OR u.level >= 10 THEN 'Trusted'
        WHEN u.reputation >= 100 OR u.level >= 5 THEN 'Member'
        ELSE 'Newcomer'
    END as trust_level
FROM users u;

COMMENT ON VIEW profile_quick_stats IS 'Optimized view for quick profile previews and tooltips';

-- 12. Performance optimization: Update table statistics
ANALYZE users;
ANALYZE user_relationships;
ANALYZE user_stats;
ANALYZE notifications;
ANALYZE achievements;
ANALYZE user_achievements;
ANALYZE profile_analytics;