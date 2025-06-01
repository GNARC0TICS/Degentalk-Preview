import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function checkRewardTables() {
  console.log('🔍 Checking reward tables...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Check if the tables exist
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('user_titles', 'user_badges') AND table_schema = 'public'
    `);

    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('Existing tables:', existingTables);
    
    await pool.query('BEGIN');
    
    // Create user_titles table if it doesn't exist
    if (!existingTables.includes('user_titles')) {
      console.log('Creating user_titles table...');
      await pool.query(`
        CREATE TABLE user_titles (
          user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          title_id INTEGER NOT NULL REFERENCES titles(title_id) ON DELETE CASCADE,
          awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, title_id)
        );
      `);
      console.log('✅ user_titles table created');
    }
    
    // Create user_badges table if it doesn't exist
    if (!existingTables.includes('user_badges')) {
      console.log('Creating user_badges table...');
      await pool.query(`
        CREATE TABLE user_badges (
          user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          badge_id INTEGER NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
          awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, badge_id)
        );
      `);
      console.log('✅ user_badges table created');
    }
    
    await pool.query('COMMIT');
    
    // Verify tables again
    const verifyResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('user_titles', 'user_badges') AND table_schema = 'public'
    `);
    
    console.log('Tables after check/creation:', verifyResult.rows.map(row => row.table_name));
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error checking/creating tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute the function
checkRewardTables()
  .then(() => console.log('Check/creation completed'))
  .catch(err => console.error('Operation failed:', err)); 