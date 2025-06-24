-- Rollback performance indices
DROP INDEX IF EXISTS idx_users_search_gin;
DROP INDEX IF EXISTS idx_users_role_status;
DROP INDEX IF EXISTS idx_posts_user_created;
DROP INDEX IF EXISTS idx_threads_user_created;
DROP INDEX IF EXISTS idx_audit_logs_timestamp_desc;
DROP INDEX IF EXISTS idx_users_username_trgm;
DROP INDEX IF EXISTS idx_site_settings_search;
DROP INDEX IF EXISTS idx_site_settings_group_key;
DROP INDEX IF EXISTS idx_posts_created_at_partial;
DROP INDEX IF EXISTS idx_threads_created_at_partial;
DROP INDEX IF EXISTS idx_wallet_transactions_type_date;
DROP INDEX IF EXISTS idx_audit_logs_action_entity;
DROP INDEX IF EXISTS idx_audit_logs_admin_id;