-- Add metadata column to user_mission_progress for extensible tracking
ALTER TABLE user_mission_progress 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for better query performance on metadata
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_metadata 
ON user_mission_progress USING gin(metadata);

-- Add comment for documentation
COMMENT ON COLUMN user_mission_progress.metadata IS 'Extensible metadata including claimedStages, lastClaimedAt, and other tracking data';

-- Update existing rows to have empty metadata
UPDATE user_mission_progress 
SET metadata = '{}' 
WHERE metadata IS NULL;