-- Enhanced Achievement System Migration
-- Extends existing achievements schema for full configurability and degen culture support

-- Enhance existing achievements table with new fields
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS key VARCHAR(100) UNIQUE;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'participation';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'common';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS icon_emoji VARCHAR(10);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50) DEFAULT 'count';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS reward_dgt INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS reward_clout INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS is_secret BOOLEAN DEFAULT false;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS is_retroactive BOOLEAN DEFAULT true;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS unlock_message TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS display_group VARCHAR(50);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhance user_achievements table with progress tracking
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS current_progress JSONB DEFAULT '{}';
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS notified_at TIMESTAMP;
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS completion_data JSONB DEFAULT '{}';

-- Create achievement events table for real-time tracking
CREATE TABLE IF NOT EXISTS achievement_events (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processing_status VARCHAR(20) DEFAULT 'pending'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievement_events_user_type ON achievement_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_achievement_events_processed ON achievement_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_achievement_events_status ON achievement_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_tier ON achievements(tier);
CREATE INDEX IF NOT EXISTS idx_achievements_key ON achievements(key);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_achievements_progress ON user_achievements(progress_percentage);

-- Create achievement categories enum for consistency
DO $$ BEGIN
    CREATE TYPE achievement_category AS ENUM (
        'participation',
        'xp', 
        'cultural',
        'secret',
        'social',
        'economy',
        'progression',
        'special'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create achievement tiers enum
DO $$ BEGIN
    CREATE TYPE achievement_tier AS ENUM (
        'common',
        'rare', 
        'epic',
        'legendary',
        'mythic'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create trigger types enum
DO $$ BEGIN
    CREATE TYPE achievement_trigger_type AS ENUM (
        'count',
        'threshold',
        'event',
        'composite',
        'custom',
        'manual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add constraints for data integrity
ALTER TABLE achievements ADD CONSTRAINT chk_achievements_category 
    CHECK (category IN ('participation', 'xp', 'cultural', 'secret', 'social', 'economy', 'progression', 'special'));

ALTER TABLE achievements ADD CONSTRAINT chk_achievements_tier
    CHECK (tier IN ('common', 'rare', 'epic', 'legendary', 'mythic'));

ALTER TABLE achievements ADD CONSTRAINT chk_achievements_trigger_type
    CHECK (trigger_type IN ('count', 'threshold', 'event', 'composite', 'custom', 'manual'));

ALTER TABLE user_achievements ADD CONSTRAINT chk_progress_percentage
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Create function to auto-generate achievement keys from names
CREATE OR REPLACE FUNCTION generate_achievement_key(achievement_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(achievement_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '_', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create function to update achievement progress
CREATE OR REPLACE FUNCTION update_achievement_progress(
    p_user_id UUID,
    p_achievement_id INTEGER,
    p_progress_data JSONB,
    p_progress_percentage DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_achievements (user_id, achievement_id, current_progress, progress_percentage, started_at)
    VALUES (p_user_id, p_achievement_id, p_progress_data, p_progress_percentage, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, achievement_id) 
    DO UPDATE SET 
        current_progress = p_progress_data,
        progress_percentage = p_progress_percentage,
        is_completed = CASE WHEN p_progress_percentage >= 100 THEN true ELSE is_completed END,
        completed_at = CASE WHEN p_progress_percentage >= 100 AND user_achievements.completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE user_achievements.completed_at END;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark achievement as completed
CREATE OR REPLACE FUNCTION complete_achievement(
    p_user_id UUID,
    p_achievement_id INTEGER,
    p_completion_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_achievements 
    SET 
        is_completed = true,
        completed_at = CURRENT_TIMESTAMP,
        progress_percentage = 100,
        completion_data = p_completion_data
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
    
    -- If no existing record, create one
    IF NOT FOUND THEN
        INSERT INTO user_achievements (
            user_id, 
            achievement_id, 
            is_completed, 
            completed_at, 
            progress_percentage,
            completion_data,
            started_at
        ) VALUES (
            p_user_id, 
            p_achievement_id, 
            true, 
            CURRENT_TIMESTAMP, 
            100,
            p_completion_data,
            CURRENT_TIMESTAMP
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE achievements IS 'Enhanced achievement definitions with flexible trigger system and degen culture support';
COMMENT ON TABLE user_achievements IS 'User achievement progress and completion tracking';
COMMENT ON TABLE achievement_events IS 'Real-time achievement event processing queue';

COMMENT ON COLUMN achievements.key IS 'Unique identifier for achievement (e.g., threadstarter, reply_goblin)';
COMMENT ON COLUMN achievements.category IS 'Achievement category for organization and filtering';
COMMENT ON COLUMN achievements.tier IS 'Rarity tier affecting visual styling and rewards';
COMMENT ON COLUMN achievements.icon_emoji IS 'Emoji fallback for achievement icon';
COMMENT ON COLUMN achievements.trigger_config IS 'JSON configuration for achievement trigger logic';
COMMENT ON COLUMN achievements.is_secret IS 'Hidden achievement until unlocked';
COMMENT ON COLUMN achievements.unlock_message IS 'Custom message shown when achievement is unlocked';
COMMENT ON COLUMN user_achievements.current_progress IS 'Current progress data toward achievement completion';
COMMENT ON COLUMN user_achievements.completion_data IS 'Data captured at time of achievement completion';