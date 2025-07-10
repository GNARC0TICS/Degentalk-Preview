-- Migration: Fix UUID Foreign Key Type Mismatches
-- Date: 2025-07-01
-- Description: Updates foreign key columns to use UUID types where they reference UUID primary keys

BEGIN;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fix 1: threads.structureId (CRITICAL - forum system broken without this)
-- This is the most critical fix as it affects all thread creation
ALTER TABLE threads 
ALTER COLUMN structure_id TYPE uuid USING gen_random_uuid();

-- Fix 2: forum_structure.parentId (forum hierarchy)
-- Convert integer parent references to UUIDs
ALTER TABLE forum_structure 
ALTER COLUMN parent_id TYPE uuid USING NULL; -- Will need manual data migration

-- Fix 3: transactions.walletId (economy system)
-- Convert integer wallet references to UUIDs
ALTER TABLE transactions 
ALTER COLUMN wallet_id TYPE uuid USING gen_random_uuid();

-- Fix 4: thread_tags.tagId (forum tagging)
-- Convert integer tag references to UUIDs
ALTER TABLE thread_tags 
ALTER COLUMN tag_id TYPE uuid USING gen_random_uuid();

-- Fix 5: levels.rewardTitleId and levels.rewardBadgeId (reward system)
ALTER TABLE levels 
ALTER COLUMN reward_title_id TYPE uuid USING NULL,
ALTER COLUMN reward_badge_id TYPE uuid USING NULL;

-- Fix 6: users table - avatar frames and cosmetics
ALTER TABLE users 
ALTER COLUMN active_frame_id TYPE uuid USING NULL,
ALTER COLUMN avatar_frame_id TYPE uuid USING NULL,
ALTER COLUMN active_title_id TYPE uuid USING NULL,
ALTER COLUMN active_badge_id TYPE uuid USING NULL;

-- Fix 7: threads.solvingPostId (thread solving feature)
ALTER TABLE threads 
ALTER COLUMN solving_post_id TYPE uuid USING NULL;

-- NOTE: The USING clauses above generate new UUIDs or set to NULL
-- This will break existing data relationships and require a proper data migration
-- In production, you would need to:
-- 1. Create a mapping table between old integer IDs and new UUIDs
-- 2. Update all foreign key references with the mapped UUIDs
-- 3. Then alter the column types

-- For development environments, this script can be run to fix the schema
-- but existing test data will need to be re-seeded

COMMIT;

-- Verification queries to check foreign key constraints are working:
-- SELECT COUNT(*) FROM threads t JOIN forum_structure fs ON t.structure_id = fs.id;
-- SELECT COUNT(*) FROM transactions t JOIN wallets w ON t.wallet_id = w.id;
-- SELECT COUNT(*) FROM thread_tags tt JOIN tags ta ON tt.tag_id = ta.id;