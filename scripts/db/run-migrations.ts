#!/usr/bin/env tsx
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import path from 'path';

config();

async function runMigrations() {
  console.log('🏃 Running migrations...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'db/migrations/postgres'),
    });
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
