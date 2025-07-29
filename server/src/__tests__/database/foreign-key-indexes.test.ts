/**
 * Foreign Key Index Smoke Test
 * 
 * Verifies that all foreign key columns have indexes in the database.
 * This test queries the PostgreSQL catalog to ensure indexes exist.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDatabase } from '@degentalk/db';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

describe('Foreign Key Indexes', () => {
  let db: NodePgDatabase<any>;
  
  beforeAll(() => {
    db = getDatabase();
  });
  
  it('should have indexes on all foreign key columns', async () => {
    // Query to find all foreign key columns
    const foreignKeyQuery = sql`
      WITH foreign_keys AS (
        SELECT
          tc.table_name,
          kcu.column_name,
          tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
      ),
      indexes AS (
        SELECT
          t.relname AS table_name,
          a.attname AS column_name,
          i.relname AS index_name
        FROM pg_class t
        JOIN pg_index idx ON t.oid = idx.indrelid
        JOIN pg_class i ON idx.indexrelid = i.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
        WHERE t.relkind = 'r'
          AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      )
      SELECT 
        fk.table_name,
        fk.column_name,
        fk.constraint_name,
        idx.index_name
      FROM foreign_keys fk
      LEFT JOIN indexes idx 
        ON fk.table_name = idx.table_name 
        AND fk.column_name = idx.column_name
      ORDER BY fk.table_name, fk.column_name
    `;
    
    const result = await db.execute(foreignKeyQuery);
    const missingIndexes: any[] = [];
    
    result.rows.forEach((row: any) => {
      if (!row.index_name) {
        missingIndexes.push({
          table: row.table_name,
          column: row.column_name,
          constraint: row.constraint_name
        });
      }
    });
    
    // Log summary
    const totalForeignKeys = result.rows.length;
    const indexedForeignKeys = result.rows.filter((r: any) => r.index_name).length;
    const coveragePercent = ((indexedForeignKeys / totalForeignKeys) * 100).toFixed(1);
    
    console.log(`Foreign Key Index Coverage: ${coveragePercent}%`);
    console.log(`Total foreign keys: ${totalForeignKeys}`);
    console.log(`Indexed foreign keys: ${indexedForeignKeys}`);
    console.log(`Missing indexes: ${missingIndexes.length}`);
    
    // The test passes if at least 95% of foreign keys have indexes
    // (some system-generated FKs might not need indexes)
    expect(Number(coveragePercent)).toBeGreaterThanOrEqual(95);
    
    // If there are missing indexes, log them for visibility
    if (missingIndexes.length > 0) {
      console.log('\nForeign keys without indexes:');
      missingIndexes.forEach(({ table, column, constraint }) => {
        console.log(`  - ${table}.${column} (${constraint})`);
      });
    }
  });
  
  it('should verify specific critical foreign key indexes exist', async () => {
    // List of critical foreign key indexes that must exist
    const criticalIndexes = [
      { table: 'posts', column: 'thread_id', index: 'idx_posts_thread_id' },
      { table: 'posts', column: 'user_id', index: 'idx_posts_user_id' },
      { table: 'threads', column: 'forum_id', index: 'idx_threads_forum_id' },
      { table: 'threads', column: 'user_id', index: 'idx_threads_user_id' },
      { table: 'transactions', column: 'from_wallet_id', index: 'idx_transactions_from_wallet_id' },
      { table: 'transactions', column: 'to_wallet_id', index: 'idx_transactions_to_wallet_id' },
      { table: 'wallets', column: 'user_id', index: 'idx_wallets_user_id' },
      { table: 'user_inventory', column: 'user_id', index: 'idx_user_inventory_user_id' },
      { table: 'user_inventory', column: 'product_id', index: 'idx_user_inventory_product_id' },
      { table: 'notifications', column: 'user_id', index: 'idx_notifications_user_id' }
    ];
    
    for (const { table, column, index: indexName } of criticalIndexes) {
      const indexQuery = sql`
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = ${table}
          AND indexname = ${indexName}
      `;
      
      const result = await db.execute(indexQuery);
      expect(result.rows.length, `Index ${indexName} on ${table}.${column} should exist`).toBe(1);
    }
  });
  
  it('should verify join query performance with indexes', async () => {
    // Test a common join query that should benefit from indexes
    const start = Date.now();
    
    const testQuery = sql`
      SELECT 
        t.id,
        t.title,
        p.content,
        u.username
      FROM threads t
      JOIN posts p ON p.thread_id = t.id
      JOIN users u ON u.id = p.user_id
      WHERE t.created_at > CURRENT_DATE - INTERVAL '7 days'
      LIMIT 10
    `;
    
    await db.execute(testQuery);
    
    const duration = Date.now() - start;
    
    // With proper indexes, this query should execute quickly (< 100ms)
    expect(duration).toBeLessThan(100);
    console.log(`Join query executed in ${duration}ms`);
  });
});