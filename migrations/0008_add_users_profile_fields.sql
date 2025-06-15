-- Migration to add profile fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status_line TEXT,
ADD COLUMN IF NOT EXISTS pinned_post_id INTEGER;

-- Note: Standard SQL does not support IF NOT EXISTS for ADD CONSTRAINT.
-- If this migration needs to be re-runnable without error on an existing constraint,
-- it would require a more complex conditional execution block or dropping the constraint first.
-- For now, assuming migrations are run once or the constraint creation will fail gracefully if it exists.
ALTER TABLE users
ADD CONSTRAINT fk_users_pinned_post_id FOREIGN KEY (pinned_post_id) REFERENCES posts(post_id) ON DELETE SET NULL;
