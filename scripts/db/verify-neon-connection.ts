/**
 * Verify connection to Neon database
 * This script checks if the Neon database connection is working properly
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon for WebSocket support
neonConfig.webSocketConstructor = ws;

// Validate
if (!process.env.NEON_DATABASE_URL) {
  console.error('❌ NEON_DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function verifyConnection() {
  console.log('🔄 Verifying connection to Neon database...');
  
  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10000
  });
  
  try {
    // Test query
    const result = await pool.query('SELECT version();');
    const version = result.rows[0].version;
    
    console.log('✅ Successfully connected to Neon database');
    console.log(`ℹ️ PostgreSQL version: ${version}`);
    
    // Check for existing tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows;
    console.log(`ℹ️ Found ${tables.length} tables in the database`);
    
    if (tables.length > 0) {
      // Display the first 10 tables
      const tableList = tables.slice(0, 10).map(t => t.table_name).join(', ');
      console.log(`ℹ️ Sample tables: ${tableList}${tables.length > 10 ? '...' : ''}`);
      
      // Count total records in users table
      try {
        const usersResult = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`ℹ️ Users table contains ${usersResult.rows[0].count} records`);
      } catch (error) {
        console.log('ℹ️ Users table not found or could not be queried');
      }
    } else {
      console.log('⚠️ No tables found in the database');
    }
    
    console.log('');
    console.log('🎉 Neon database is ready to use!');
    
  } catch (error) {
    console.error('❌ Failed to connect to Neon database:', error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
    console.log('ℹ️ Database connection closed');
  }
}

// Run the verification
verifyConnection()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });