-- Rollback Levels Visual Fields Migration

ALTER TABLE levels DROP COLUMN IF EXISTS unlocks;
ALTER TABLE levels DROP COLUMN IF EXISTS animation_effect;
ALTER TABLE levels DROP COLUMN IF EXISTS color_theme;
ALTER TABLE levels DROP COLUMN IF EXISTS frame_url;
ALTER TABLE levels DROP COLUMN IF EXISTS rarity;
ALTER TABLE levels DROP COLUMN IF EXISTS icon_url; 