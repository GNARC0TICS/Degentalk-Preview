import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

async function addCategoryIdColumn() {
  console.log('🚀 Adding categoryId column to thread_prefixes table');
  const pool = new Pool({ connectionString: process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL });

  try {
    // SQL to add the category_id column if it doesn't exist
    const sql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = 'thread_prefixes'
          AND column_name = 'category_id'
        ) THEN
          ALTER TABLE thread_prefixes ADD COLUMN category_id INTEGER;
          ALTER TABLE thread_prefixes ADD CONSTRAINT fk_thread_prefixes_category FOREIGN KEY (category_id) REFERENCES forum_categories(category_id) ON DELETE SET NULL;
          CREATE INDEX IF NOT EXISTS idx_thread_prefixes_category_id ON thread_prefixes(category_id);
        END IF;
      END;
      $$;
    `;

    // Execute the SQL
    await pool.query(sql);
    console.log('✅ Successfully added categoryId column to thread_prefixes table');
  } catch (error) {
    console.error('❌ Error adding categoryId column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute the function
addCategoryIdColumn()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
