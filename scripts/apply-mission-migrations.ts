#!/usr/bin/env node

/**
 * Apply mission migrations directly
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function applyMigrations() {
  console.log('🚀 Applying mission system migrations...\n');

  try {
    // Read SQL files
    const fs = await import('fs').then(m => m.promises);
    const migrationsPath = path.join(process.cwd(), 'db/migrations');
    
    const conditionsSql = await fs.readFile(
      path.join(migrationsPath, 'add-mission-conditions.sql'),
      'utf-8'
    );
    
    const metadataSql = await fs.readFile(
      path.join(migrationsPath, 'add-mission-metadata.sql'),
      'utf-8'
    );

    console.log('📄 Found migration files:');
    console.log('  - add-mission-conditions.sql');
    console.log('  - add-mission-metadata.sql\n');

    // Use psql to apply migrations
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set');
    }

    console.log('📦 Applying migrations via psql...');
    
    // Apply conditions migration
    console.log('\n1️⃣ Applying mission conditions migration...');
    const conditionsCmd = `echo "${conditionsSql.replace(/"/g, '\\"')}" | psql "${dbUrl}"`;
    const { stdout: stdout1, stderr: stderr1 } = await execAsync(conditionsCmd);
    if (stderr1 && !stderr1.includes('NOTICE')) {
      console.error('⚠️ Conditions migration warnings:', stderr1);
    }
    console.log('✅ Mission conditions migration applied');

    // Apply metadata migration
    console.log('\n2️⃣ Applying mission metadata migration...');
    const metadataCmd = `echo "${metadataSql.replace(/"/g, '\\"')}" | psql "${dbUrl}"`;
    const { stdout: stdout2, stderr: stderr2 } = await execAsync(metadataCmd);
    if (stderr2 && !stderr2.includes('NOTICE')) {
      console.error('⚠️ Metadata migration warnings:', stderr2);
    }
    console.log('✅ Mission metadata migration applied');

    console.log('\n🎉 All mission migrations applied successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

applyMigrations();