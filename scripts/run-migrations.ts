import * as dotenv from 'dotenv';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '@db/schema';

dotenv.config();

async function runMigrations() {
  console.log('🚀 Starting migration runner...');
  
  // Use DIRECT connection for migrations
  const connectionString = process.env.DIRECT_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DIRECT_DATABASE_URL not found in environment');
  }
  
  console.log('📡 Using direct connection (no pooler) for migrations...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    
    const db = drizzle(client, { schema });
    
    console.log('📦 Running migrations...');
    await migrate(db, { migrationsFolder: './db/migrations/postgres' });
    
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMigrations };