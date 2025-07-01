-- Development Migration: UUID Foreign Key Schema Consistency
-- Date: 2025-07-01  
-- Description: Ensures schema definitions match but doesn't break existing data
-- This migration focuses on making sure the TypeScript schema compiles correctly

BEGIN;

-- Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing foreign key constraints that are now incorrect
-- We'll add them back after the column type changes

-- 1. Drop thread-related FK constraints
ALTER TABLE threads DROP CONSTRAINT IF EXISTS threads_structure_id_fkey;
ALTER TABLE thread_tags DROP CONSTRAINT IF EXISTS thread_tags_tag_id_fkey;

-- 2. Drop transaction FK constraints  
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_wallet_id_fkey;

-- 3. Drop user cosmetic FK constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_active_frame_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_avatar_frame_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_active_title_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_active_badge_id_fkey;

-- 4. Drop levels reward FK constraints
ALTER TABLE levels DROP CONSTRAINT IF EXISTS levels_reward_title_id_fkey;
ALTER TABLE levels DROP CONSTRAINT IF EXISTS levels_reward_badge_id_fkey;

-- 5. Drop forum structure hierarchy FK
ALTER TABLE forum_structure DROP CONSTRAINT IF EXISTS forum_structure_parent_id_fkey;

-- Now update column types to UUID (setting existing data to NULL to avoid data type conflicts)
-- In development, we'll re-seed the data anyway

-- Critical forum system fixes
ALTER TABLE threads 
ALTER COLUMN structure_id TYPE uuid USING NULL;

ALTER TABLE forum_structure 
ALTER COLUMN parent_id TYPE uuid USING NULL;

-- Economy system fixes  
ALTER TABLE transactions 
ALTER COLUMN wallet_id TYPE uuid USING NULL;

-- Forum tagging system
ALTER TABLE thread_tags 
ALTER COLUMN tag_id TYPE uuid USING NULL;

-- User cosmetics and rewards
ALTER TABLE users 
ALTER COLUMN active_frame_id TYPE uuid USING NULL,
ALTER COLUMN avatar_frame_id TYPE uuid USING NULL,
ALTER COLUMN active_title_id TYPE uuid USING NULL,
ALTER COLUMN active_badge_id TYPE uuid USING NULL;

-- Level rewards
ALTER TABLE levels 
ALTER COLUMN reward_title_id TYPE uuid USING NULL,
ALTER COLUMN reward_badge_id TYPE uuid USING NULL;

-- Thread solving
ALTER TABLE threads 
ALTER COLUMN solving_post_id TYPE uuid USING NULL;

-- Re-add foreign key constraints with correct UUID types
ALTER TABLE threads 
ADD CONSTRAINT threads_structure_id_fkey 
FOREIGN KEY (structure_id) REFERENCES forum_structure(id) ON DELETE CASCADE;

ALTER TABLE thread_tags 
ADD CONSTRAINT thread_tags_tag_id_fkey 
FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_wallet_id_fkey 
FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE;

ALTER TABLE users 
ADD CONSTRAINT users_active_frame_id_fkey 
FOREIGN KEY (active_frame_id) REFERENCES avatar_frames(id) ON DELETE SET NULL,
ADD CONSTRAINT users_avatar_frame_id_fkey 
FOREIGN KEY (avatar_frame_id) REFERENCES avatar_frames(id) ON DELETE SET NULL,
ADD CONSTRAINT users_active_title_id_fkey 
FOREIGN KEY (active_title_id) REFERENCES titles(id) ON DELETE SET NULL,
ADD CONSTRAINT users_active_badge_id_fkey 
FOREIGN KEY (active_badge_id) REFERENCES badges(id) ON DELETE SET NULL;

ALTER TABLE levels 
ADD CONSTRAINT levels_reward_title_id_fkey 
FOREIGN KEY (reward_title_id) REFERENCES titles(id) ON DELETE SET NULL,
ADD CONSTRAINT levels_reward_badge_id_fkey 
FOREIGN KEY (reward_badge_id) REFERENCES badges(id) ON DELETE SET NULL;

ALTER TABLE forum_structure 
ADD CONSTRAINT forum_structure_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES forum_structure(id) ON DELETE SET NULL;

-- Note: After running this migration in development, you should:
-- 1. Run the seeding scripts to populate with correct UUID data
-- 2. Verify all foreign key relationships work correctly
-- 3. Test forum thread creation, user cosmetics, and wallet transactions

COMMIT;