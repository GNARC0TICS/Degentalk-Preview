import { Pool } from 'pg';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
config();

async function applyMigration(migrationFileName?: string) {
  console.log('🚀 Applying SQL migration directly');
  const pool = new Pool({ connectionString: process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL });

  try {
    // Get the migration filename from command line args or use default
    const fileName = migrationFileName || '0000_loose_black_bird.sql';
    
    // Read the generated SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', fileName);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    console.log(`Using migration file: ${fileName}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Split by the statement-breakpoint comments
    const statements = sqlContent.split('-->')
      .map(statement => statement.trim())
      .filter(statement => statement && !statement.startsWith('statement-breakpoint'));

    console.log(`Executing ${statements.length} SQL statements...`);

    // Apply each statement separately
    for (let i = 0; i < statements.length; i++) {
      try {
        await pool.query(statements[i]);
        if (i % 20 === 0 || i === statements.length - 1) {
          console.log(`Progress: ${i+1}/${statements.length}`);
        }
      } catch (err) {
        console.log(`Error in statement ${i+1}/${statements.length}:`);
        console.log(`First 100 chars: ${statements[i].substring(0, 100)}...`);
        console.log(`Error: ${err.message}`);
        // Continue with next statement even if this one fails
      }
    }
    
    console.log('✅ Migration completed');
  } catch (error) {
    console.error('❌ Error in migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get the migration filename from command line arguments
const migrationFileName = process.argv[2];

// Execute the migration
applyMigration(migrationFileName)
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 