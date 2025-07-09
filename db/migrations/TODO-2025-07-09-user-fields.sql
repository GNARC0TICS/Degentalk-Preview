-- STREAM-LOCK: B
-- TODO: DB Migration for new user fields identified in Stream B
-- Phase 5 Interface Architecture updates

-- Add totalXp field to users table
-- This field tracks the total XP accumulated by a user across all activities
ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;

-- Add reputation field to users table  
-- This field tracks the user's reputation score based on community interactions
ALTER TABLE users ADD COLUMN reputation INTEGER DEFAULT 0;

-- Add display settings as JSONB to user_settings table
-- This stores user display preferences like theme, fontSize, etc.
ALTER TABLE user_settings ADD COLUMN display_settings JSONB DEFAULT '{
  "theme": "system",
  "fontSize": "medium", 
  "threadDisplayMode": "card",
  "reducedMotion": false,
  "hideNsfw": true,
  "showMatureContent": false,
  "showOfflineUsers": true
}';

-- Add level_config as JSONB to user_levels table
-- This stores level progression configuration
ALTER TABLE user_levels ADD COLUMN level_config JSONB DEFAULT '{
  "level": 1,
  "name": "Newcomer",
  "minXp": 0,
  "maxXp": 100,
  "color": "#gray"
}';

-- Create indexes for performance
CREATE INDEX idx_users_total_xp ON users(total_xp);
CREATE INDEX idx_users_reputation ON users(reputation);
CREATE INDEX idx_user_settings_display ON user_settings USING gin(display_settings);

-- Update existing users to have default values
UPDATE users SET total_xp = COALESCE(xp, 0) WHERE total_xp IS NULL;
UPDATE users SET reputation = 0 WHERE reputation IS NULL;

-- Add constraints
ALTER TABLE users ADD CONSTRAINT chk_users_total_xp_positive CHECK (total_xp >= 0);
ALTER TABLE users ADD CONSTRAINT chk_users_reputation_range CHECK (reputation >= -1000 AND reputation <= 10000);

-- Migration notes:
-- 1. Run this during low-traffic window
-- 2. Monitor performance after index creation
-- 3. Validate data integrity after migration
-- 4. Update application code to use new fields
-- 5. Test transformer changes with new fields