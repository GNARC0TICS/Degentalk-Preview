-- Admin Performance Optimization Migration
-- Generated: 2025-06-24T05:36:26.648Z
-- Purpose: Optimize high-traffic admin endpoints

BEGIN;

-- Phase 1: Critical Performance Indices (Run first, highest impact)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_gin 
  ON users USING gin(to_tsvector('english', username || ' ' || email));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status 
  ON users(role, status, isActive);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_created 
  ON posts(userId, createdAt);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_user_created 
  ON threads(userId, createdAt);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp_desc 
  ON audit_logs(timestamp DESC);

-- Phase 2: Search Optimization (Requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_trgm 
  ON users USING gin(username gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_settings_search 
  ON siteSettings USING gin(to_tsvector('english', key || ' ' || name || ' ' || description));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_settings_group_key 
  ON siteSettings(group, key);

-- Phase 3: Analytics Optimization (Partial indices for recent data)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at_partial 
  ON posts(createdAt) WHERE createdAt >= '2024-01-01';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_created_at_partial 
  ON threads(createdAt) WHERE createdAt >= '2024-01-01';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallet_transactions_type_date 
  ON wallet_transactions(type, createdAt);

-- Phase 4: Audit and Admin Specific
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_entity 
  ON audit_logs(action, entityType, timestamp);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_admin_id 
  ON audit_logs(adminId, timestamp);

-- Analyze tables after index creation
ANALYZE users;
ANALYZE posts;
ANALYZE threads;
ANALYZE audit_logs;
ANALYZE siteSettings;
ANALYZE wallet_transactions;

COMMIT;

-- Performance monitoring queries to run after deployment:
/*
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
ORDER BY idx_scan DESC;

-- Check slow queries
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements 
WHERE query LIKE '%admin%' 
ORDER BY total_time DESC 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/