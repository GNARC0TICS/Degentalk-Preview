import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function applyLuciaMigration() {
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL not found in environment');
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'db/migrations/postgres/0016_add_lucia_sessions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Applying Lucia session migration...');
    await client.query(migrationSQL);
    
    // Verify the table was created
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_session'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ user_session table created successfully!');
    } else {
      throw new Error('Failed to create user_session table');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
applyLuciaMigration()
  .then(() => {
    console.log('🎉 Lucia migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });