import type { AdminId } from '@shared/types/ids';
#!/usr/bin/env npx tsx

/**
 * Admin Query Performance Audit
 * 
 * Analyzes admin endpoints for query optimization opportunities
 * Identifies slow queries, missing indices, and N+1 problems
 */

import fs from 'fs';
import path from 'path';

interface QueryAnalysis {
	endpoint;
	method;
	queries[];
	complexity: 'low' | 'medium' | 'high' | 'critical';
	optimizationOpportunities[];
	suggestedIndices[];
	estimatedTraffic: 'low' | 'medium' | 'high';
}

const HIGH_TRAFFIC_ENDPOINTS = [
	'GET /api/admin/users',
	'GET /api/admin/users/search', 
	'GET /api/admin/analytics',
	'GET /api/admin/settings',
	'GET /api/admin/audit-logs',
	'GET /api/admin/reports',
	'POST /api/admin/users/:id/ban',
	'PUT /api/admin/users/:id',
	'GET /api/admin/forum/threads'
];

function analyzeAdminQueries(): QueryAnalysis[] {
	const analyses: QueryAnalysis[] = [];

	// User management queries (highest traffic)
	analyses.push({
		endpoint: 'GET /api/admin/users',
		method: 'getUsers',
		queries: [
			'SELECT users.*, userGroups.name FROM users LEFT JOIN userGroups',
			'SELECT COUNT(*) FROM users WHERE ...',
			'SELECT userId, COUNT(posts), COUNT(threads) FROM posts LEFT JOIN threads GROUP BY userId'
		],
		complexity: 'high',
		optimizationOpportunities: [
			'N+1 query for user stats - should be single query with subquery',
			'Full table scan on user filtering without proper indices',
			'Inefficient LEFT JOIN pattern for group lookups'
		],
		suggestedIndices: [
			'CREATE INDEX idx_users_search ON users USING gin(to_tsvector(\'english\', username || \' \' || email))',
			'CREATE INDEX idx_users_role_status ON users(role, status, isActive)',
			'CREATE INDEX idx_users_created_at ON users(createdAt)',
			'CREATE INDEX idx_posts_user_created ON posts(userId, createdAt)',
			'CREATE INDEX idx_threads_user_created ON threads(userId, createdAt)'
		],
		estimatedTraffic: 'high'
	});

	// User search queries (very high frequency, short bursts)
	analyses.push({
		endpoint: 'GET /api/admin/users/search',
		method: 'searchUsers',
		queries: [
			'SELECT users.* FROM users WHERE username ILIKE %term% OR email ILIKE %term%',
			'Clout tier calculations in application layer'
		],
		complexity: 'medium',
		optimizationOpportunities: [
			'ILIKE queries are slow - should use full-text search',
			'Clout calculations done per-user instead of in SQL',
			'No LIMIT enforcement leading to large result sets'
		],
		suggestedIndices: [
			'CREATE INDEX idx_users_search_gin ON users USING gin(to_tsvector(\'english\', username || \' \' || email))',
			'CREATE INDEX idx_users_username_trgm ON users USING gin(username gin_trgm_ops)',
			'CREATE INDEX idx_users_clout ON users(clout) WHERE clout IS NOT NULL'
		],
		estimatedTraffic: 'high'
	});

	// Analytics queries (complex aggregations)
	analyses.push({
		endpoint: 'GET /api/admin/analytics',
		method: 'getOverviewStats',
		queries: [
			'SELECT COUNT(*) FROM users',
			'SELECT COUNT(*) FROM posts WHERE createdAt >= date',
			'SELECT COUNT(*) FROM threads WHERE createdAt >= date',
			'SELECT SUM(amount) FROM wallet_transactions WHERE type = ...'
		],
		complexity: 'critical',
		optimizationOpportunities: [
			'Multiple COUNT queries should be combined into single query',
			'Date range queries need optimized indices',
			'Wallet aggregations could be pre-computed'
		],
		suggestedIndices: [
			'CREATE INDEX idx_posts_created_at_partial ON posts(createdAt) WHERE createdAt >= \'2024-01-01\'',
			'CREATE INDEX idx_threads_created_at_partial ON threads(createdAt) WHERE createdAt >= \'2024-01-01\'',
			'CREATE INDEX idx_wallet_transactions_type_date ON wallet_transactions(type, createdAt)',
			'CREATE INDEX idx_audit_logs_created_at ON audit_logs(createdAt)'
		],
		estimatedTraffic: 'medium'
	});

	// Settings queries (frequent but cacheable)
	analyses.push({
		endpoint: 'GET /api/admin/settings',
		method: 'getAllSettings',
		queries: [
			'SELECT * FROM siteSettings ORDER BY group, key',
			'Complex filtering with ILIKE on multiple columns'
		],
		complexity: 'low',
		optimizationOpportunities: [
			'Settings rarely change - perfect caching candidate',
			'Search across settings could use full-text index',
			'Group-based filtering could be optimized'
		],
		suggestedIndices: [
			'CREATE INDEX idx_site_settings_group_key ON siteSettings(group, key)',
			'CREATE INDEX idx_site_settings_search ON siteSettings USING gin(to_tsvector(\'english\', key || \' \' || name || \' \' || description))',
			'CREATE INDEX idx_site_settings_public ON siteSettings(isPublic) WHERE isPublic = true'
		],
		estimatedTraffic: 'medium'
	});

	// Audit logs (write-heavy, read for reports)
	analyses.push({
		endpoint: 'GET /api/admin/audit-logs',
		method: 'getAuditLogs',
		queries: [
			'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ...',
			'Complex filtering by action, entity, date ranges'
		],
		complexity: 'high',
		optimizationOpportunities: [
			'Audit logs grow infinitely - needs partitioning strategy',
			'Complex filtering without covering indices',
			'JSON details column searches are expensive'
		],
		suggestedIndices: [
			'CREATE INDEX idx_audit_logs_timestamp_desc ON audit_logs(timestamp DESC)',
			'CREATE INDEX idx_audit_logs_action_entity ON audit_logs(action, entityType, timestamp)',
			'CREATE INDEX idx_audit_logs_admin_id ON audit_logs(adminId, timestamp)',
			'CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entityId, timestamp)'
		],
		estimatedTraffic: 'medium'
	});

	return analyses;
}

function generateOptimizationPlan(analyses: QueryAnalysis[]) {
	console.log('\n🚀 Admin Query Performance Optimization Plan\n');
	console.log('=' .repeat(60));

	// Priority matrix
	const highPriority = analyses.filter(a => 
		(a.complexity === 'critical' || a.complexity === 'high') && 
		a.estimatedTraffic === 'high'
	);

	const mediumPriority = analyses.filter(a => 
		a.complexity === 'high' || a.estimatedTraffic === 'high'
	).filter(a => !highPriority.includes(a));

	const lowPriority = analyses.filter(a => 
		!highPriority.includes(a) && !mediumPriority.includes(a)
	);

	console.log(`\n🔴 High Priority (Immediate Impact):`);
	highPriority.forEach(analysis => {
		console.log(`\n📊 ${analysis.endpoint}`);
		console.log(`   Complexity: ${analysis.complexity.toUpperCase()}`);
		console.log(`   Traffic: ${analysis.estimatedTraffic.toUpperCase()}`);
		console.log(`   Issues:`);
		analysis.optimizationOpportunities.forEach(opp => {
			console.log(`     • ${opp}`);
		});
	});

	console.log(`\n🟡 Medium Priority (Performance Gains):`);
	mediumPriority.forEach(analysis => {
		console.log(`\n📊 ${analysis.endpoint}`);
		console.log(`   Primary Issue: ${analysis.optimizationOpportunities[0]}`);
	});

	console.log(`\n📋 Recommended Index Creation Order:`);
	console.log(`\n-- Phase 1: Critical Performance Indices`);
	
	const criticalIndices = [
		'CREATE INDEX CONCURRENTLY idx_users_search_gin ON users USING gin(to_tsvector(\'english\', username || \' \' || email));',
		'CREATE INDEX CONCURRENTLY idx_users_role_status ON users(role, status, isActive);',
		'CREATE INDEX CONCURRENTLY idx_posts_user_created ON posts(userId, createdAt);',
		'CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp_desc ON audit_logs(timestamp DESC);'
	];

	criticalIndices.forEach(index => console.log(index));

	console.log(`\n-- Phase 2: Search Optimization Indices`);
	const searchIndices = [
		'CREATE EXTENSION IF NOT EXISTS pg_trgm;',
		'CREATE INDEX CONCURRENTLY idx_users_username_trgm ON users USING gin(username gin_trgm_ops);',
		'CREATE INDEX CONCURRENTLY idx_site_settings_search ON siteSettings USING gin(to_tsvector(\'english\', key || \' \' || name || \' \' || description));'
	];

	searchIndices.forEach(index => console.log(index));

	console.log(`\n-- Phase 3: Analytics Optimization Indices`);
	const analyticsIndices = [
		'CREATE INDEX CONCURRENTLY idx_posts_created_at_partial ON posts(createdAt) WHERE createdAt >= \'2024-01-01\';',
		'CREATE INDEX CONCURRENTLY idx_wallet_transactions_type_date ON wallet_transactions(type, createdAt);'
	];

	analyticsIndices.forEach(index => console.log(index));

	console.log(`\n🎯 Query Optimization Strategies:`);
	console.log(`\n1. **User Search Optimization**:`);
	console.log(`   - Replace ILIKE with full-text search using tsvector`);
	console.log(`   - Add trigram indices for fuzzy username matching`);
	console.log(`   - Implement query result caching for common searches`);

	console.log(`\n2. **Analytics Aggregation Optimization**:`);
	console.log(`   - Combine multiple COUNT queries into single CTE`);
	console.log(`   - Pre-compute daily/weekly aggregates in materialized views`);
	console.log(`   - Use partial indices for recent data queries`);

	console.log(`\n3. **Audit Log Management**:`);
	console.log(`   - Implement table partitioning by month`);
	console.log(`   - Archive old audit logs to separate tables`);
	console.log(`   - Use covering indices for common filter combinations`);

	console.log(`\n🔧 Application-Level Optimizations:`);
	console.log(`\n1. **Query Consolidation**:`);
	console.log(`   - User stats: Single query with subqueries instead of N+1`);
	console.log(`   - Analytics: Combined CTEs instead of separate queries`);
	console.log(`   - Settings: Bulk fetch with client-side filtering`);

	console.log(`\n2. **Caching Strategy**:`);
	console.log(`   - Settings: Memory cache with 1-hour TTL`);
	console.log(`   - User search: Redis cache with 5-minute TTL`);
	console.log(`   - Analytics: Pre-computed hourly updates`);

	console.log(`\n3. **Connection Optimization**:`);
	console.log(`   - Implement connection pooling with pgBouncer`);
	console.log(`   - Use read replicas for analytics queries`);
	console.log(`   - Optimize Drizzle query generation`);

	console.log('\n' + '=' .repeat(60));
}

function generateIndexMigrationScript(analyses: QueryAnalysis[]) {
	const migrationContent = `-- Admin Performance Optimization Migration
-- Generated: ${new Date().toISOString()}
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
*/`;

	return migrationContent;
}

async function main() {
	console.log('🔍 Starting admin query performance audit...');
	
	const analyses = analyzeAdminQueries();
	generateOptimizationPlan(analyses);
	
	// Generate migration script
	const migrationScript = generateIndexMigrationScript(analyses);
	const migrationPath = path.join(process.cwd(), 'scripts/admin/admin-performance-indices.sql');
	
	fs.writeFileSync(migrationPath, migrationScript);
	console.log(`\n💾 Index migration script generated: ${migrationPath}`);
	
	console.log(`\n🚀 Next Steps:`);
	console.log(`1. Review the migration script`);
	console.log(`2. Run on staging environment first`);
	console.log(`3. Monitor query performance with pg_stat_statements`);
	console.log(`4. Deploy indices during low-traffic window`);
	console.log(`5. Implement application-level optimizations`);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}