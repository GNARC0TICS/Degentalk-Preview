import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function updateUsersTable() {
  console.log('🔄 Updating users table structure...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Step 1: Check current structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('Current users table has', tableStructure.rows.length, 'columns');
    
    // Step 2: Add missing columns
    console.log('Updating users table structure...');
    
    // Add transaction for safety
    await pool.query('BEGIN');

    // Check if active_title_id exists
    const hasActiveTitleId = tableStructure.rows.some(col => col.column_name === 'active_title_id');
    if (!hasActiveTitleId) {
      console.log('Adding active_title_id column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS active_title_id INTEGER;
      `);
    }
    
    // Check if active_badge_id exists
    const hasActiveBadgeId = tableStructure.rows.some(col => col.column_name === 'active_badge_id');
    if (!hasActiveBadgeId) {
      console.log('Adding active_badge_id column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS active_badge_id INTEGER;
      `);
    }
    
    // Rename reputation to reputation if it exists
    const hasReputation = tableStructure.rows.some(col => col.column_name === 'reputation');
    if (hasReputation) {
      console.log('Renaming reputation to reputation...');
      await pool.query(`
        ALTER TABLE users 
        RENAME COLUMN reputation TO reputation;
      `);
    }
    
    await pool.query('COMMIT');
    
    // Step 3: Verify the updated structure
    const updatedStructure = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN ('active_title_id', 'active_badge_id', 'reputation')
      ORDER BY ordinal_position;
    `);

    console.log('Updated columns:');
    console.table(updatedStructure.rows);
    
    console.log('✅ Users table structure updated successfully');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error updating users table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute the function
updateUsersTable()
  .then(() => console.log('Update completed'))
  .catch(err => console.error('Update failed:', err)); 