-- 0015_archive_legacy_forum_columns.sql
-- Preserve legacy columns into JSONB before deletion to avoid data loss
-- Generated 2025-06-16
-- ---------------------------------------------------------------
BEGIN;

-- 1. Forum legacy columns
ALTER TABLE IF EXISTS forum_categories
  ADD COLUMN IF NOT EXISTS legacy_dump JSONB;

UPDATE forum_categories SET legacy_dump = jsonb_strip_nulls(COALESCE(legacy_dump, '{}') || jsonb_build_object(
  'is_zone', is_zone,
  'canonical', canonical,
  'forum_type', forum_type,
  'slug_override', slug_override,
  'components', components,
  'thread_rules', thread_rules,
  'access_control', access_control,
  'display_priority', display_priority,
  'seo', seo
));

-- Now drop the legacy columns if they exist
ALTER TABLE IF EXISTS forum_categories
  DROP COLUMN IF EXISTS is_zone,
  DROP COLUMN IF EXISTS canonical,
  DROP COLUMN IF EXISTS forum_type,
  DROP COLUMN IF EXISTS slug_override,
  DROP COLUMN IF EXISTS components,
  DROP COLUMN IF EXISTS thread_rules,
  DROP COLUMN IF EXISTS access_control,
  DROP COLUMN IF EXISTS display_priority,
  DROP COLUMN IF EXISTS seo;

-- 2. User legacy columns
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS legacy_dump JSONB;

UPDATE users SET legacy_dump = jsonb_strip_nulls(COALESCE(legacy_dump, '{}') || jsonb_build_object(
  'unlocked_emojis', unlocked_emojis,
  'unlocked_stickers', unlocked_stickers,
  'equipped_flair_emoji', equipped_flair_emoji
));

ALTER TABLE IF EXISTS users
  DROP COLUMN IF EXISTS unlocked_emojis,
  DROP COLUMN IF EXISTS unlocked_stickers,
  DROP COLUMN IF EXISTS equipped_flair_emoji;

COMMIT; 