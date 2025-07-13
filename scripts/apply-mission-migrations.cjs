#!/usr/bin/env node

/**
 * Apply mission migrations directly
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');

const execAsync = promisify(exec);

async function applyMigrations() {
  console.log('🚀 Applying mission system migrations...\n');

  try {
    // Load environment variables
    dotenv.config({ path: '.env.local' });
    
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
    
    // Write temp files to avoid shell escaping issues
    const tempConditions = '/tmp/mission-conditions.sql';
    const tempMetadata = '/tmp/mission-metadata.sql';
    
    await fs.writeFile(tempConditions, conditionsSql);
    await fs.writeFile(tempMetadata, metadataSql);
    
    // Apply conditions migration
    console.log('\n1️⃣ Applying mission conditions migration...');
    try {
      const { stdout: stdout1, stderr: stderr1 } = await execAsync(`psql "${dbUrl}" -f ${tempConditions}`);
      if (stderr1 && !stderr1.includes('NOTICE')) {
        console.error('⚠️ Conditions migration warnings:', stderr1);
      }
      console.log('✅ Mission conditions migration applied');
    } catch (err) {
      console.error('❌ Conditions migration error:', err.message);
    }

    // Apply metadata migration
    console.log('\n2️⃣ Applying mission metadata migration...');
    try {
      const { stdout: stdout2, stderr: stderr2 } = await execAsync(`psql "${dbUrl}" -f ${tempMetadata}`);
      if (stderr2 && !stderr2.includes('NOTICE')) {
        console.error('⚠️ Metadata migration warnings:', stderr2);
      }
      console.log('✅ Mission metadata migration applied');
    } catch (err) {
      console.error('❌ Metadata migration error:', err.message);
    }

    // Clean up temp files
    await fs.unlink(tempConditions).catch(() => {});
    await fs.unlink(tempMetadata).catch(() => {});

    console.log('\n🎉 Migration process completed!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigrations();