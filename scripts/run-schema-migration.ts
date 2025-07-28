import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

async function runSchemaMigration() {
  console.log('📝 Running schema migration...');
  
  try {
    // Add isFeatured column
    await db.execute(sql`
      ALTER TABLE forum_structure 
      ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false
    `);
    console.log('✅ Added is_featured column');

    // Add index for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_forum_structure_is_featured 
      ON forum_structure(is_featured)
    `);
    console.log('✅ Added is_featured index');

    // Add theme_preset column
    await db.execute(sql`
      ALTER TABLE forum_structure 
      ADD COLUMN IF NOT EXISTS theme_preset TEXT
    `);
    console.log('✅ Added theme_preset column');

    console.log('\n🎉 Schema migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

runSchemaMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));