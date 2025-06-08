import { db } from '@db';
import { sql } from 'drizzle-orm';
import { logger } from '@core/logger';

/**
 * Migration: Add emoji/sticker unlock fields to users table
 * 
 * Adds:
 * - unlockedEmojis: JSONB array of emoji IDs user has unlocked
 * - unlockedStickers: JSONB array of sticker IDs user has unlocked  
 * - equippedFlairEmoji: VARCHAR for currently equipped flair emoji ID
 */

async function addEmojiStickerFields() {
    try {
        console.log('🎭 Starting emoji/sticker fields migration...');

        // Add unlocked emojis field
        await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS unlocked_emojis JSONB DEFAULT '[]'::jsonb;
    `);
        console.log('✅ Added unlocked_emojis field');

        // Add unlocked stickers field
        await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS unlocked_stickers JSONB DEFAULT '[]'::jsonb;
    `);
        console.log('✅ Added unlocked_stickers field');

        // Add equipped flair emoji field
        await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS equipped_flair_emoji VARCHAR(100);
    `);
        console.log('✅ Added equipped_flair_emoji field');

        // Add indexes for better performance
        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_unlocked_emojis 
      ON users USING GIN (unlocked_emojis);
    `);
        console.log('✅ Added GIN index for unlocked_emojis');

        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_unlocked_stickers 
      ON users USING GIN (unlocked_stickers);
    `);
        console.log('✅ Added GIN index for unlocked_stickers');

        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_equipped_flair_emoji 
      ON users (equipped_flair_emoji);
    `);
        console.log('✅ Added index for equipped_flair_emoji');

        // Initialize all existing users with free emojis/stickers
        const freeEmojis = ['smile', 'heart']; // From cosmetics.config.ts
        const freeStickers = ['thumbs_up']; // From cosmetics.config.ts

        await db.execute(sql`
      UPDATE users 
      SET 
        unlocked_emojis = ${JSON.stringify(freeEmojis)}::jsonb,
        unlocked_stickers = ${JSON.stringify(freeStickers)}::jsonb
      WHERE 
        unlocked_emojis IS NULL 
        OR unlocked_stickers IS NULL
        OR unlocked_emojis = '[]'::jsonb;
    `);
        console.log('✅ Initialized existing users with free emojis/stickers');

        console.log('\n🎭 Emoji/sticker fields migration completed successfully!');
        console.log('💡 Users now have emoji/sticker unlock tracking');
        console.log('😎 Free emojis/stickers have been granted to all existing users');
        console.log('🛍️ Shop items can now unlock premium emojis/stickers');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error in emoji/sticker migration:', error);
        logger.error('EMOJI_STICKER_MIGRATION', 'Failed to add emoji/sticker fields', error);
        process.exit(1);
    }
}

// Run the migration
addEmojiStickerFields();
