import { db } from '../db';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data in the database!');
  console.log('Starting database reset...');
  
  try {
    // Get all table names
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    // Drop all tables
    for (const row of tables.rows) {
      const tableName = (row as any).tablename;
      console.log(`Dropping table: ${tableName}`);
      await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
    }
    
    console.log('✅ All tables dropped successfully!');
    console.log('\nNow run:');
    console.log('1. npm run db:push');
    console.log('2. npm run sync:forums');
    console.log('3. npm run seed:all');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Confirm before running
if (process.argv.includes('--force')) {
  resetDatabase();
} else {
  console.log('⚠️  This will DELETE ALL DATA!');
  console.log('Run with --force flag to confirm:');
  console.log('npx tsx scripts/reset-db-clean.ts --force');
} 