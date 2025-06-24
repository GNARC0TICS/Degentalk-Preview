-- Admin Performance Optimization Indices
-- Applied via MCP, tracked here for consistency

-- Phase 1: Critical Performance Indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_gin 
  ON users USING gin(to_tsvector('english', username || ' ' || email));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status 
  ON users(role, status, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_created 
  ON posts(user_id, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_user_created 
  ON threads(user_id, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp_desc 
  ON audit_logs(created_at DESC);

-- Phase 2: Search Optimization
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_trgm 
  ON users USING gin(username gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_settings_search 
  ON site_settings USING gin(to_tsvector('english', key || ' ' || name || ' ' || description));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_settings_group_key 
  ON site_settings("group", key);

-- Phase 3: Analytics Optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at_partial 
  ON posts(created_at) WHERE created_at >= '2024-01-01';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_created_at_partial 
  ON threads(created_at) WHERE created_at >= '2024-01-01';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_type_date 
  ON transactions(type, created_at);

-- Phase 4: Audit Specific
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_entity 
  ON audit_logs(action, entity_type, created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_admin_id 
  ON audit_logs(admin_id, created_at);