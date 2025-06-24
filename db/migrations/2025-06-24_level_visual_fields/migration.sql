-- Levels Visual Fields Migration
-- Adds icon, rarity, frame, colour theme, animation & unlocks JSON to levels table
-- Back-fills sensible defaults for existing data

-- 1️⃣ Add new columns (safe if already present)
ALTER TABLE levels ADD COLUMN IF NOT EXISTS icon_url VARCHAR(255);
ALTER TABLE levels ADD COLUMN IF NOT EXISTS rarity VARCHAR(10) DEFAULT 'common';
ALTER TABLE levels ADD COLUMN IF NOT EXISTS frame_url VARCHAR(255);
ALTER TABLE levels ADD COLUMN IF NOT EXISTS color_theme VARCHAR(25);
ALTER TABLE levels ADD COLUMN IF NOT EXISTS animation_effect VARCHAR(30);
ALTER TABLE levels ADD COLUMN IF NOT EXISTS unlocks JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2️⃣ Back-fill defaults for pre-existing rows
UPDATE levels SET rarity = 'common' WHERE rarity IS NULL;
UPDATE levels SET unlocks = '{}'::jsonb WHERE unlocks IS NULL;
-- Colour theme mapping based on legacy procedural colour rules
UPDATE levels SET color_theme = 'emerald' WHERE color_theme IS NULL AND level < 10;
UPDATE levels SET color_theme = 'cyan'    WHERE color_theme IS NULL AND level >= 10 AND level < 25;
UPDATE levels SET color_theme = 'purple'  WHERE color_theme IS NULL AND level >= 25 AND level < 50;
UPDATE levels SET color_theme = 'amber'   WHERE color_theme IS NULL AND level >= 50;

-- 3️⃣ Document forthcoming column rename
COMMENT ON COLUMN levels.min_xp IS 'Total cumulative XP required (will be aliased to xp_required in future refactor)'; 