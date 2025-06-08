import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function updateLevelsTable() {
  console.log('🔄 Updating levels table structure...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Step 1: Check current structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'levels'
      ORDER BY ordinal_position;
    `);

    console.log('Current table structure:');
    console.table(tableStructure.rows);
    
    // Step 2: Add missing columns and rename existing ones if needed
    console.log('Updating table structure...');
    
    // Add transaction for safety
    await pool.query('BEGIN');
    
    // Rename reward_points to reward_dgt if it exists
    const hasRewardPoints = tableStructure.rows.some(col => col.column_name === 'reward_points');
    if (hasRewardPoints) {
      console.log('Renaming reward_points to reward_dgt...');
      await pool.query(`
        ALTER TABLE levels 
        RENAME COLUMN reward_points TO reward_dgt;
      `);
    } else {
      // Add reward_dgt if it doesn't exist at all
      console.log('Adding reward_dgt column...');
      await pool.query(`
        ALTER TABLE levels 
        ADD COLUMN IF NOT EXISTS reward_dgt INTEGER DEFAULT 0;
      `);
    }
    
    // Add reward_title_id if it doesn't exist
    const hasRewardTitleId = tableStructure.rows.some(col => col.column_name === 'reward_title_id');
    if (!hasRewardTitleId) {
      console.log('Adding reward_title_id column...');
      await pool.query(`
        ALTER TABLE levels 
        ADD COLUMN IF NOT EXISTS reward_title_id INTEGER;
      `);
    }
    
    // Add reward_badge_id if it doesn't exist
    const hasRewardBadgeId = tableStructure.rows.some(col => col.column_name === 'reward_badge_id');
    if (!hasRewardBadgeId) {
      console.log('Adding reward_badge_id column...');
      await pool.query(`
        ALTER TABLE levels 
        ADD COLUMN IF NOT EXISTS reward_badge_id INTEGER;
      `);
    }
    
    await pool.query('COMMIT');
    
    // Step 3: Verify the updated structure
    const updatedStructure = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'levels'
      ORDER BY ordinal_position;
    `);

    console.log('Updated table structure:');
    console.table(updatedStructure.rows);
    
    console.log('✅ Levels table structure updated successfully');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error updating levels table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute the function
updateLevelsTable()
  .then(() => console.log('Update completed'))
  .catch(err => console.error('Update failed:', err)); 