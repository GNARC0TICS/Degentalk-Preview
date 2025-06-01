import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function checkLevelsTable() {
  console.log('🔍 Checking levels table structure...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Get table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'levels'
      ORDER BY ordinal_position;
    `);

    console.log('Current table structure:');
    console.table(tableStructure.rows);

    // Check if name column exists
    const nameColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'levels' AND column_name = 'name';
    `);

    if (nameColumn.rows.length > 0) {
      console.log('✅ Name column exists in levels table');
    } else {
      console.log('❌ Name column does NOT exist in levels table');
      
      // Add the name column if it doesn't exist
      console.log('Adding name column to levels table...');
      await pool.query(`
        ALTER TABLE levels 
        ADD COLUMN IF NOT EXISTS name VARCHAR(100);
      `);
      console.log('✅ Name column added to levels table');
    }
  } catch (error) {
    console.error('Error checking levels table:', error);
  } finally {
    await pool.end();
  }
}

// Execute the function
checkLevelsTable()
  .then(() => console.log('Check completed'))
  .catch(err => console.error('Check failed:', err)); 