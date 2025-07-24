#!/usr/bin/env tsx
/**
 * Apply performance indexes to the database
 * Run with: pnpm tsx scripts/apply-performance-indexes.ts
 */

import { db } from '@db';
import { sql } from 'drizzle-orm';
import { logger } from '@api/core/logger';

const indexes = [
  // Thread performance indexes
  'CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_threads_created_at_desc ON threads(created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_threads_last_post_at_desc ON threads(last_post_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_threads_post_count_desc ON threads(post_count DESC)',
  'CREATE INDEX IF NOT EXISTS idx_threads_view_count_desc ON threads(view_count DESC)',
  'CREATE INDEX IF NOT EXISTS idx_threads_visibility_status ON threads(visibility_status)',
  'CREATE INDEX IF NOT EXISTS idx_threads_is_deleted ON threads(is_deleted) WHERE is_deleted = false',
  
  // Posts performance indexes
  'CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON posts(thread_id)',
  'CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_posts_is_deleted ON posts(is_deleted) WHERE is_deleted = false',
  'CREATE INDEX IF NOT EXISTS idx_posts_thread_created ON posts(thread_id, created_at)',
  
  // User activity indexes
  'CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username))',
  'CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email))',
  'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users(last_active_at)',
  'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = true',
  
  // Forum structure indexes
  'CREATE INDEX IF NOT EXISTS idx_forum_structure_parent_id ON forum_structure(parent_id)',
  'CREATE INDEX IF NOT EXISTS idx_forum_structure_type ON forum_structure(type)',
  'CREATE INDEX IF NOT EXISTS idx_forum_structure_slug ON forum_structure(slug)',
  
  // Transactions and wallet indexes
  'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_created_at_desc ON transactions(created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
  
  // Shoutbox performance indexes
  'CREATE INDEX IF NOT EXISTS idx_shoutbox_messages_room_id ON shoutbox_messages(room_id)',
  'CREATE INDEX IF NOT EXISTS idx_shoutbox_messages_created_at_desc ON shoutbox_messages(created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_shoutbox_messages_user_id ON shoutbox_messages(user_id)',
  
  // Achievement and XP indexes
  'CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id)',
  'CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_xp_logs_created_at_desc ON xp_logs(created_at DESC)',
  
  // Social features indexes
  'CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id)',
  'CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id)',
  'CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user_id ON mentions(mentioned_user_id)',
  'CREATE INDEX IF NOT EXISTS idx_mentions_source_id_type ON mentions(source_id, source_type)',
  
  // Notification indexes
  'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_created_at_desc ON notifications(created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false',
  
  // Session and auth indexes
  'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)',
  
  // Composite indexes for common query patterns
  'CREATE INDEX IF NOT EXISTS idx_threads_structure_created_desc ON threads(structure_id, created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_posts_thread_deleted_created ON posts(thread_id, is_deleted, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_user_type_created ON transactions(user_id, type, created_at DESC)',
  
  // Partial indexes for better performance on filtered queries
  'CREATE INDEX IF NOT EXISTS idx_threads_active_recent ON threads(created_at DESC) WHERE is_deleted = false AND visibility_status = \'published\'',
  'CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(thread_id, created_at) WHERE is_deleted = false',
  
  // Function-based index for case-insensitive username searches
  'CREATE INDEX IF NOT EXISTS idx_users_username_ci ON users(LOWER(username))',
];

async function applyIndexes() {
  logger.info('PerformanceIndexes', 'Starting to apply performance indexes...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const indexSql of indexes) {
    try {
      // Extract index name for logging
      const indexName = indexSql.match(/INDEX IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
      
      logger.info('PerformanceIndexes', `Creating index: ${indexName}`);
      await db.execute(sql.raw(indexSql));
      
      successCount++;
      logger.info('PerformanceIndexes', `✅ Created index: ${indexName}`);
    } catch (error) {
      errorCount++;
      logger.error('PerformanceIndexes', `❌ Failed to create index`, {
        sql: indexSql,
        error: error.message
      });
    }
  }
  
  // Analyze tables after index creation
  const tablesToAnalyze = ['threads', 'posts', 'users', 'transactions', 'shoutbox_messages'];
  
  logger.info('PerformanceIndexes', 'Analyzing tables to update statistics...');
  
  for (const table of tablesToAnalyze) {
    try {
      await db.execute(sql.raw(`ANALYZE ${table}`));
      logger.info('PerformanceIndexes', `✅ Analyzed table: ${table}`);
    } catch (error) {
      logger.error('PerformanceIndexes', `❌ Failed to analyze table: ${table}`, {
        error: error.message
      });
    }
  }
  
  logger.info('PerformanceIndexes', 'Index application complete!', {
    total: indexes.length,
    success: successCount,
    errors: errorCount
  });
  
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the script
applyIndexes().catch((error) => {
  logger.error('PerformanceIndexes', 'Script failed', { error });
  process.exit(1);
});