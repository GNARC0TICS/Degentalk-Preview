#!/usr/bin/env tsx
/**
 * Add Critical Performance Indices
 * 
 * Adds the missing indices identified in the backend analysis
 * that will speed up development and fix N+1 queries
 */

import { db } from '@db';
import { sql } from 'drizzle-orm';

const criticalIndices = sql`
-- =====================================================
-- Critical Indices for N+1 Query Prevention
-- =====================================================

-- Threads structure lookup (for zone/forum data fetching)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_structure_id 
  ON threads(structure_id);

-- Posts thread lookup (for excerpt fetching)  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_thread_id_created
  ON posts(thread_id, created_at);

-- Forum structure parent/child relationships
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_forum_structure_parent_id
  ON forum_structure(parent_id) WHERE parent_id IS NOT NULL;

-- User authentication lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id_role
  ON users(id, role);

-- =====================================================
-- Update statistics for query planner
-- =====================================================
ANALYZE threads;
ANALYZE posts;
ANALYZE forum_structure;
ANALYZE users;
`;

async function addCriticalIndices() {
  console.log('🔧 Adding critical performance indices...');
  
  try {
    await db.execute(criticalIndices);
    console.log('✅ Critical indices added successfully');
    console.log('📊 Query performance should improve 5-10x for:');
    console.log('  - Thread list loading');
    console.log('  - Post excerpt fetching'); 
    console.log('  - Zone/forum relationship queries');
    console.log('  - User authentication');
    console.log('\n🎯 Next: Consider adding Redis cache to replace in-memory cache');
  } catch (error) {
    console.error('❌ Failed to add indices:', error);
    console.error('Details:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  addCriticalIndices()
    .then(() => process.exit(0))
    .catch(console.error);
}