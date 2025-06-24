-- 0022_alternative_fix_mentions_thread_id.sql
-- Alternative approach: Direct casting with USING clause
-- Use this if the main approach doesn't work

-- Option 1: Direct casting (if thread_id is already numeric-compatible)
-- ALTER TABLE mentions 
-- ALTER COLUMN thread_id TYPE integer USING thread_id::integer;

-- Option 2: If thread_id has mixed data types, clean it first
-- Update any non-numeric values to NULL before casting
UPDATE mentions 
SET thread_id = NULL 
WHERE thread_id IS NOT NULL 
AND thread_id !~ '^[0-9]+$';

-- Then perform the cast
ALTER TABLE mentions 
ALTER COLUMN thread_id TYPE integer USING thread_id::integer;

-- Re-add the foreign key constraint if it was dropped
ALTER TABLE mentions 
DROP CONSTRAINT IF EXISTS mentions_thread_id_threads_thread_id_fk;

ALTER TABLE mentions 
ADD CONSTRAINT mentions_thread_id_threads_thread_id_fk 
FOREIGN KEY (thread_id) REFERENCES threads(thread_id) ON DELETE CASCADE;