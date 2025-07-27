import { db } from '@db';
import { sql } from 'drizzle-orm';

export async function createMissingTables() {
  console.log('🔄 Applying schema changes / creating missing tables...');

  try {
    // Create withdrawal_status enum if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status') THEN
          CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
        END IF;
      END $$;
    `);
    console.log('✅ Created withdrawal_status enum (if needed)');
    
    // Create chat_messages table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        message_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
    `);
    console.log('✅ Created chat_messages table (if not exists)');
    
    // Create withdrawal_requests table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        request_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        amount BIGINT NOT NULL,
        status withdrawal_status NOT NULL DEFAULT 'pending',
        wallet_address VARCHAR(255) NOT NULL,
        transaction_id INTEGER REFERENCES transactions(transaction_id) ON DELETE SET NULL,
        processing_fee BIGINT NOT NULL DEFAULT 0,
        request_notes TEXT,
        admin_notes TEXT,
        processed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fulfilled_at TIMESTAMP,
        processed_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
      CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);
    `);
    console.log('✅ Created withdrawal_requests table (if not exists)');
    
    // Create avatar_frames table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS avatar_frames (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        rarity TEXT DEFAULT 'common',
        animated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created avatar_frames table (if not exists)');
    
    // Create content_edit_status enum if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_edit_status') THEN
          CREATE TYPE content_edit_status AS ENUM ('draft', 'published', 'archived');
        END IF;
      END $$;
    `);
    console.log('✅ Created content_edit_status enum (if needed)');
    
    // Create forum_rules table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS forum_rules (
        rule_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        content_html TEXT,
        section VARCHAR(100) NOT NULL DEFAULT 'general',
        position INTEGER NOT NULL DEFAULT 0,
        status content_edit_status NOT NULL DEFAULT 'published',
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        last_agreed_version_hash VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
        updated_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_forum_rules_section ON forum_rules(section);
      CREATE INDEX IF NOT EXISTS idx_forum_rules_status ON forum_rules(status);
    `);
    console.log('✅ Created forum_rules table (if not exists)');
    
    // Create user_rules_agreements table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_rules_agreements (
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        rule_id INTEGER NOT NULL REFERENCES forum_rules(rule_id) ON DELETE CASCADE,
        version_hash VARCHAR(255) NOT NULL,
        agreed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, rule_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_rules_agreements_user_id ON user_rules_agreements(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_rules_agreements_rule_id ON user_rules_agreements(rule_id);
    `);
    console.log('✅ Created user_rules_agreements table (if not exists)');
    
    // Check if avatar_frame_id column exists in users table
    const avatarFrameIdExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'avatar_frame_id';
    `);
    
    // Add avatar_frame_id column if it doesn't exist
    if (avatarFrameIdExists.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN avatar_frame_id INTEGER REFERENCES avatar_frames(id);
      `);
      console.log('✅ Added avatar_frame_id column to users table');
    } else {
      console.log('ℹ️ avatar_frame_id column already exists in users table');
    }
    
    // Add forum_categories missing columns
    // Check if min_xp column exists in forum_categories table
    const minXpExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'forum_categories' 
      AND column_name = 'min_xp';
    `);
    
    // Add min_xp column if it doesn't exist
    if (minXpExists.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE forum_categories
        ADD COLUMN min_xp INTEGER DEFAULT 0;
      `);
      console.log('✅ Added min_xp column to forum_categories table');
    } else {
      console.log('ℹ️ min_xp column already exists in forum_categories table');
    }
    
    // Check if plugin_data column exists in forum_categories table
    const pluginDataExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'forum_categories' 
      AND column_name = 'plugin_data';
    `);
    
    // Add plugin_data column if it doesn't exist
    if (pluginDataExists.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE forum_categories
        ADD COLUMN plugin_data JSONB DEFAULT '{}';
      `);
      console.log('✅ Added plugin_data column to forum_categories table');
    } else {
      console.log('ℹ️ plugin_data column already exists in forum_categories table');
    }
    
    // Check if color column exists in forum_categories table
    const colorExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'forum_categories' 
      AND column_name = 'color';
    `);
    
    // Add color column if it doesn't exist
    if (colorExists.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE forum_categories
        ADD COLUMN color VARCHAR(20);
      `);
      console.log('✅ Added color column to forum_categories table');
    } else {
      console.log('ℹ️ color column already exists in forum_categories table');
    }
    
    // Check if icon column exists in forum_categories table
    const iconExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'forum_categories' 
      AND column_name = 'icon';
    `);
    
    // Add icon column if it doesn't exist
    if (iconExists.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE forum_categories
        ADD COLUMN icon VARCHAR(100);
      `);
      console.log('✅ Added icon column to forum_categories table');
    } else {
      console.log('ℹ️ icon column already exists in forum_categories table');
    }
    
    // Check if is_hidden column exists in forum_categories table
    const isHiddenExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'forum_categories' 
      AND column_name = 'is_hidden';
    `);
    
    // Add is_hidden column if it doesn't exist
    if (isHiddenExists.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE forum_categories
        ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;
      `);
      console.log('✅ Added is_hidden column to forum_categories table');
    } else {
      console.log('ℹ️ is_hidden column already exists in forum_categories table');
    }
    
    console.log('✅ All schema changes applied successfully');
  } catch (error) {
    console.error('❌ Error applying schema changes:', error);
    // Re-throw the error if not self-executing, so server/index.ts can catch it
    if (import.meta.url !== `file://${process.argv[1]}`) {
      throw error;
    }
  }
}

// Self-execution block for direct script running (e.g., via package.json script)
// This checks if the script is the main module being run.
if (import.meta.url === `file://${process.argv[1]}` || (process.env.TSX_SCRIPT_PATH && process.env.TSX_SCRIPT_PATH.endsWith('scripts/db/create-missing-tables.ts'))) {
  createMissingTables()
    .then(() => {
      console.log('Schema update script completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Schema update script failed:', err);
      process.exit(1);
    });
}
