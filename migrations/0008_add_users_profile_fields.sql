-- Migration to add profile fields to users table
ALTER TABLE users
ADD COLUMN status_line TEXT,
ADD COLUMN pinned_post_id INTEGER,
ADD CONSTRAINT fk_users_pinned_post_id FOREIGN KEY (pinned_post_id) REFERENCES posts(post_id) ON DELETE SET NULL;
