-- Migration: Convert shoutbox varchar(128) user IDs to UUID with foreign keys
-- Date: 2025-07-03
-- Description: Migrates all shoutbox-related tables from varchar(128) user IDs to proper UUID columns with foreign key constraints

BEGIN;

-- 1. Create temporary columns for UUID migration
ALTER TABLE shoutbox_config 
  ADD COLUMN created_by_uuid UUID,
  ADD COLUMN updated_by_uuid UUID;

ALTER TABLE shoutbox_banned_words 
  ADD COLUMN created_by_uuid UUID;

ALTER TABLE shoutbox_user_ignores 
  ADD COLUMN user_id_uuid UUID,
  ADD COLUMN ignored_user_id_uuid UUID;

ALTER TABLE shoutbox_emoji_permissions 
  ADD COLUMN created_by_uuid UUID;

ALTER TABLE shoutbox_analytics 
  ADD COLUMN user_id_uuid UUID;

-- 2. Migrate existing data (assuming user IDs are already valid UUIDs stored as varchar)
-- If IDs are CUIDs or other format, additional conversion logic would be needed

-- shoutbox_config
UPDATE shoutbox_config 
SET created_by_uuid = created_by::UUID 
WHERE created_by IS NOT NULL AND created_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

UPDATE shoutbox_config 
SET updated_by_uuid = updated_by::UUID 
WHERE updated_by IS NOT NULL AND updated_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- shoutbox_banned_words
UPDATE shoutbox_banned_words 
SET created_by_uuid = created_by::UUID 
WHERE created_by IS NOT NULL AND created_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- shoutbox_user_ignores
UPDATE shoutbox_user_ignores 
SET user_id_uuid = user_id::UUID 
WHERE user_id IS NOT NULL AND user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

UPDATE shoutbox_user_ignores 
SET ignored_user_id_uuid = ignored_user_id::UUID 
WHERE ignored_user_id IS NOT NULL AND ignored_user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- shoutbox_emoji_permissions
UPDATE shoutbox_emoji_permissions 
SET created_by_uuid = created_by::UUID 
WHERE created_by IS NOT NULL AND created_by ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- shoutbox_analytics
UPDATE shoutbox_analytics 
SET user_id_uuid = user_id::UUID 
WHERE user_id IS NOT NULL AND user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- 3. Add foreign key constraints to new columns
ALTER TABLE shoutbox_config
  ADD CONSTRAINT fk_shoutbox_config_created_by FOREIGN KEY (created_by_uuid) REFERENCES users(user_id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_shoutbox_config_updated_by FOREIGN KEY (updated_by_uuid) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE shoutbox_banned_words
  ADD CONSTRAINT fk_shoutbox_banned_words_created_by FOREIGN KEY (created_by_uuid) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE shoutbox_user_ignores
  ADD CONSTRAINT fk_shoutbox_user_ignores_user_id FOREIGN KEY (user_id_uuid) REFERENCES users(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_shoutbox_user_ignores_ignored_user_id FOREIGN KEY (ignored_user_id_uuid) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE shoutbox_emoji_permissions
  ADD CONSTRAINT fk_shoutbox_emoji_permissions_created_by FOREIGN KEY (created_by_uuid) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE shoutbox_analytics
  ADD CONSTRAINT fk_shoutbox_analytics_user_id FOREIGN KEY (user_id_uuid) REFERENCES users(user_id) ON DELETE SET NULL;

-- 4. Drop old columns and rename new ones
ALTER TABLE shoutbox_config 
  DROP COLUMN created_by,
  DROP COLUMN updated_by;

ALTER TABLE shoutbox_config 
  RENAME COLUMN created_by_uuid TO created_by;
ALTER TABLE shoutbox_config 
  RENAME COLUMN updated_by_uuid TO updated_by;

ALTER TABLE shoutbox_banned_words 
  DROP COLUMN created_by;
ALTER TABLE shoutbox_banned_words 
  RENAME COLUMN created_by_uuid TO created_by;

ALTER TABLE shoutbox_user_ignores 
  DROP COLUMN user_id,
  DROP COLUMN ignored_user_id;
ALTER TABLE shoutbox_user_ignores 
  RENAME COLUMN user_id_uuid TO user_id;
ALTER TABLE shoutbox_user_ignores 
  RENAME COLUMN ignored_user_id_uuid TO ignored_user_id;

ALTER TABLE shoutbox_emoji_permissions 
  DROP COLUMN created_by;
ALTER TABLE shoutbox_emoji_permissions 
  RENAME COLUMN created_by_uuid TO created_by;

ALTER TABLE shoutbox_analytics 
  DROP COLUMN user_id;
ALTER TABLE shoutbox_analytics 
  RENAME COLUMN user_id_uuid TO user_id;

-- 5. Update unique constraints (if needed)
-- The unique constraint on shoutbox_user_ignores should still work with the renamed columns

-- 6. Add indexes for foreign keys (if not automatically created)
CREATE INDEX IF NOT EXISTS idx_shoutbox_config_created_by ON shoutbox_config(created_by);
CREATE INDEX IF NOT EXISTS idx_shoutbox_config_updated_by ON shoutbox_config(updated_by);
CREATE INDEX IF NOT EXISTS idx_shoutbox_banned_words_created_by ON shoutbox_banned_words(created_by);
CREATE INDEX IF NOT EXISTS idx_shoutbox_user_ignores_user_id ON shoutbox_user_ignores(user_id);
CREATE INDEX IF NOT EXISTS idx_shoutbox_user_ignores_ignored_user_id ON shoutbox_user_ignores(ignored_user_id);
CREATE INDEX IF NOT EXISTS idx_shoutbox_emoji_permissions_created_by ON shoutbox_emoji_permissions(created_by);
CREATE INDEX IF NOT EXISTS idx_shoutbox_analytics_user_id ON shoutbox_analytics(user_id);

COMMIT;

-- Rollback script (in case of issues)
-- BEGIN;
-- ALTER TABLE shoutbox_config DROP CONSTRAINT IF EXISTS fk_shoutbox_config_created_by;
-- ALTER TABLE shoutbox_config DROP CONSTRAINT IF EXISTS fk_shoutbox_config_updated_by;
-- ALTER TABLE shoutbox_banned_words DROP CONSTRAINT IF EXISTS fk_shoutbox_banned_words_created_by;
-- ALTER TABLE shoutbox_user_ignores DROP CONSTRAINT IF EXISTS fk_shoutbox_user_ignores_user_id;
-- ALTER TABLE shoutbox_user_ignores DROP CONSTRAINT IF EXISTS fk_shoutbox_user_ignores_ignored_user_id;
-- ALTER TABLE shoutbox_emoji_permissions DROP CONSTRAINT IF EXISTS fk_shoutbox_emoji_permissions_created_by;
-- ALTER TABLE shoutbox_analytics DROP CONSTRAINT IF EXISTS fk_shoutbox_analytics_user_id;
-- -- etc... (reverse all changes)
-- ROLLBACK;