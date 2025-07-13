-- Add conditions column to missions table for flexible mission requirements
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS conditions TEXT;

-- Add stages column for stacking missions
ALTER TABLE missions
ADD COLUMN IF NOT EXISTS stages JSONB;

-- Fix the missionId type mismatch in user_mission_progress
-- First drop the foreign key constraint
ALTER TABLE user_mission_progress 
DROP CONSTRAINT IF EXISTS user_mission_progress_mission_id_missions_id_fk;

-- Change the column type from integer to uuid
ALTER TABLE user_mission_progress 
ALTER COLUMN mission_id TYPE uuid USING mission_id::text::uuid;

-- Re-add the foreign key constraint
ALTER TABLE user_mission_progress
ADD CONSTRAINT user_mission_progress_mission_id_missions_id_fk 
FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_missions_type_active ON missions(type, is_active);
CREATE INDEX IF NOT EXISTS idx_missions_required_action ON missions(required_action) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_user_completed ON user_mission_progress(user_id, is_completed);

-- Add comment for documentation
COMMENT ON COLUMN missions.conditions IS 'JSON object containing custom mission requirements (forumId, timeWindow, minWordCount, etc)';
COMMENT ON COLUMN missions.stages IS 'JSONB array for stacking missions with progressive rewards';