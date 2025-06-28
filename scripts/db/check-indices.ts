#!/usr/bin/env tsx
/**
 * Check Applied Database Indices
 * 
 * Verify which indices are currently applied to the database
 */

import { db } from '@db';
import { sql } from 'drizzle-orm';

async function checkAppliedIndices() {
  console.log('🔍 Checking applied database indices...\n');
  
  try {
    const indices = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);

    if (indices.length === 0) {
      console.log('❌ No custom indices found');
      return;
    }

    console.log(`✅ Found ${indices.length} custom indices:\n`);
    
    let currentTable = '';
    for (const index of indices) {
      if (index.tablename !== currentTable) {
        if (currentTable) console.log('');
        console.log(`📊 Table: ${index.tablename}`);
        currentTable = index.tablename;
      }
      console.log(`  - ${index.indexname}`);
    }

    console.log('\n🔧 Critical indices status:');
    const criticalIndices = [
      'idx_threads_structure_id',
      'idx_posts_thread_id_created', 
      'idx_forum_structure_parent_id',
      'idx_users_id_role'
    ];

    const foundIndices = indices.map(i => i.indexname);
    
    criticalIndices.forEach(name => {
      const status = foundIndices.includes(name) ? '✅' : '❌';
      console.log(`  ${status} ${name}`);
    });

  } catch (error) {
    console.error('❌ Failed to check indices:', error);
  }
}

if (import.meta.main) {
  checkAppliedIndices()
    .then(() => process.exit(0))
    .catch(console.error);
}