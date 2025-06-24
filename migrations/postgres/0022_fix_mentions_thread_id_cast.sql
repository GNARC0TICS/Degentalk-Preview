-- 0022_fix_mentions_thread_id_cast.sql
-- Fix thread_id column type casting issue in mentions table

-- First, check if there are any non-integer values that need to be handled
-- We'll use a safe approach to handle the conversion

-- Step 1: Create a temporary column with integer type
ALTER TABLE mentions ADD COLUMN thread_id_temp integer;

-- Step 2: Update the temporary column, handling any conversion issues
-- This converts string/text thread_id values to integers, setting NULL for non-convertible values
UPDATE mentions 
SET thread_id_temp = CASE 
    WHEN thread_id IS NULL THEN NULL
    WHEN thread_id ~ '^[0-9]+$' THEN thread_id::integer
    ELSE NULL
END;

-- Step 3: Drop the old thread_id column
ALTER TABLE mentions DROP COLUMN thread_id;

-- Step 4: Rename the temporary column to thread_id
ALTER TABLE mentions RENAME COLUMN thread_id_temp TO thread_id;

-- Step 5: Re-add the foreign key constraint
ALTER TABLE mentions 
ADD CONSTRAINT mentions_thread_id_threads_thread_id_fk 
FOREIGN KEY (thread_id) REFERENCES threads(thread_id) ON DELETE CASCADE;

-- Step 6: Add index for performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_mentions_thread_id ON mentions(thread_id);