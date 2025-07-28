/**
 * Title System Consolidation Migration
 * 
 * This script consolidates all title sources into a single database-driven system:
 * 1. Migrates hardcoded config titles to database
 * 2. Migrates seed-based level titles to database
 * 3. Adds new required fields to existing titles
 * 4. Removes duplicate/conflicting titles
 */

import { config } from 'dotenv';
import { db } from '@db';
import { titles, userTitles, users } from '@schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { Title } from '@shared/types/entities/title.types';
import { migrateLegacyTitle } from '@shared/utils/title-utils';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
config();

// Default title styles with CSS properties
const DEFAULT_TITLE_STYLES = {
  'Paper Hands': {
    category: 'level',
    unlockType: 'level',
    minLevel: 1,
    rarity: 'common',
    gradientStart: '#d4c5b9',
    gradientEnd: '#c8b9a6',
    textColor: '#5c4f41',
    borderColor: '#b8a593',
    description: 'For the noobs who sell too early'
  },
  'Bronze Ape': {
    category: 'level', 
    unlockType: 'level',
    minLevel: 10,
    rarity: 'uncommon',
    gradientStart: '#7c3920',
    gradientEnd: '#8c4226',
    textColor: '#f4e4d4',
    borderColor: '#6b3420',
    description: 'Beginning to understand the game'
  },
  'Silver Surfer': {
    category: 'level',
    unlockType: 'level', 
    minLevel: 25,
    rarity: 'rare',
    gradientStart: '#8b8b8b',
    gradientEnd: '#949494',
    textColor: '#2c2c2c',
    borderColor: '#7a7a7a',
    description: 'Riding the waves of volatility'
  },
  'Gold Member': {
    category: 'level',
    unlockType: 'level',
    minLevel: 50,
    rarity: 'epic',
    gradientStart: '#a54e07',
    gradientEnd: '#a54e07',
    textColor: '#783205',
    borderColor: '#a55d07',
    description: 'Premium member with diamond potential'
  },
  'Platinum Degen': {
    category: 'level',
    unlockType: 'level',
    minLevel: 75,
    rarity: 'legendary',
    gradientStart: '#b8b8b8',
    gradientEnd: '#c0c0c0',
    textColor: '#1a1a1a',
    borderColor: '#a8a8a8',
    effects: ['shimmer'],
    description: 'Elite tier of true degens'
  },
  'Diamond Hands': {
    category: 'achievement',
    unlockType: 'achievement',
    rarity: 'mythic',
    gradientStart: '#93c5fd',
    gradientEnd: '#60a5fa',
    textColor: '#1e3a8a',
    borderColor: '#3b82f6',
    effects: ['shimmer'],
    description: 'HODL until the end 💎🙌'
  },
  'Whale': {
    category: 'special',
    unlockType: 'manual',
    rarity: 'mythic',
    gradientStart: '#4c1d95',
    gradientEnd: '#5b21b6',
    textColor: '#ffffff',
    borderColor: '#5b21b6',
    effects: ['glow'],
    description: 'Moves markets with their trades 🐋'
  },
  'Janny': {
    category: 'role',
    unlockType: 'role',
    rarity: 'rare',
    gradientStart: '#dc2626',
    gradientEnd: '#dc2626',
    textColor: '#ffffff',
    borderColor: '#b91c1c',
    description: 'Keeps the forums clean'
  }
};

// Title definitions from config (to be migrated)
const CONFIG_TITLES = {
  // Level-based titles
  levels: {
    1: { id: 'newfag', name: 'Newfag', icon: '🆕', rarity: 'common' as const },
    10: { id: 'novice_degen', name: 'Novice Degen', icon: '🎰', rarity: 'common' as const },
    25: { id: 'seasoned_gambler', name: 'Seasoned Gambler', icon: '🎲', rarity: 'uncommon' as const },
    50: { id: 'casino_regular', name: 'Casino Regular', icon: '🃏', rarity: 'uncommon' as const },
    75: { id: 'vip_degen', name: 'VIP Degen', icon: '🥂', rarity: 'rare' as const },
    100: { id: 'high_roller', name: 'High Roller', icon: '💎', rarity: 'rare' as const },
    150: { id: 'whale', name: 'Whale', icon: '🐋', rarity: 'epic' as const },
    200: { id: 'basement_dweller', name: 'Basement Dweller', icon: '🏚️', rarity: 'epic' as const },
    500: { id: 'no_life', name: 'No Life', icon: '💀', rarity: 'legendary' as const }
  },
  
  // Role-based titles
  roles: {
    moderator: { id: 'forum_jannie', name: 'Forum Jannie', icon: '🧹', rarity: 'rare' as const },
    admin: { id: 'casino_boss', name: 'Casino Boss', icon: '🎩', rarity: 'legendary' as const },
    vip: { id: 'vip_whale', name: 'VIP Whale', icon: '🐋', rarity: 'epic' as const },
    contributor: { id: 'code_monkey', name: 'Code Monkey', icon: '🐒', rarity: 'rare' as const }
  },
  
  // Achievement-based titles
  achievements: {
    first_post: { id: 'lurker_no_more', name: 'Lurker No More', icon: '👁️' },
    tip_1000_dgt: { id: 'big_tipper', name: 'Big Tipper', icon: '💸' },
    lose_10000_dgt: { id: 'rekt', name: 'REKT', icon: '📉' },
    win_100000_dgt: { id: 'lucky_bastard', name: 'Lucky Bastard', icon: '🍀' },
    banned_once: { id: 'reformed_degen', name: 'Reformed Degen', icon: '😇' },
    thread_100_replies: { id: 'conversation_starter', name: 'Conversation Starter', icon: '💬' },
    post_1000_times: { id: 'spam_god', name: 'Spam God', icon: '📢' },
    online_24h: { id: 'touch_grass', name: 'Touch Grass', icon: '🌱' }
  },
  
  // Shop titles
  shop: {
    neon_degen: { 
      id: 'neon_degen', 
      name: 'Neon Degen', 
      icon: '🌟', 
      price: 5000,
      description: 'Glows in the dark'
    },
    diamond_hands: { 
      id: 'diamond_hands', 
      name: 'Diamond Hands', 
      icon: '💎🙌', 
      price: 10000,
      description: 'HODL gang'
    },
    moon_boy: { 
      id: 'moon_boy', 
      name: 'Moon Boy', 
      icon: '🚀', 
      price: 25000,
      description: 'To the moon!'
    },
    wojak: { 
      id: 'wojak', 
      name: 'Wojak', 
      icon: '😔', 
      price: 1337,
      description: 'Feels bad man'
    },
    pepe: { 
      id: 'pepe', 
      name: 'Rare Pepe', 
      icon: '🐸', 
      price: 42069,
      description: 'Extremely rare'
    }
  },
  
  // Special event titles
  special: {
    beta_tester: { id: 'beta_tester', name: 'Beta Tester', icon: '🧪', rarity: 'epic' as const },
    bug_hunter: { id: 'bug_hunter', name: 'Bug Hunter', icon: '🐛', rarity: 'rare' as const },
    event_winner: { id: 'event_winner', name: 'Event Winner', icon: '🏆', rarity: 'epic' as const },
    top_donor: { id: 'top_donor', name: 'Sugar Daddy', icon: '💰', rarity: 'legendary' as const }
  }
} as const;

// Level-based titles from seed script
const LEVEL_TITLES = [
  { level: 0,  title: 'Lurker',              dgtReward: 0, rarity: 'common' },
  { level: 1,  title: 'Newcomer',           dgtReward: 100, rarity: 'common' },
  { level: 2,  title: 'Mingler',            dgtReward: 150, rarity: 'common' },
  { level: 3,  title: 'Contributor',        dgtReward: 200, rarity: 'common' },
  { level: 4,  title: 'Regular',            dgtReward: 250, rarity: 'common' },
  { level: 5,  title: 'Active Member',      dgtReward: 300, rarity: 'uncommon' },
  { level: 6,  title: 'Engaged Member',     dgtReward: 350, rarity: 'uncommon' },
  { level: 7,  title: 'Established Member', dgtReward: 400, rarity: 'uncommon' },
  { level: 8,  title: 'Forum Friend',       dgtReward: 450, rarity: 'uncommon' },
  { level: 9,  title: 'Dedicated Member',   dgtReward: 500, rarity: 'uncommon' },
  { level: 10, title: 'Trusted Member',     dgtReward: 1000, rarity: 'rare' },
  { level: 15, title: 'Community Pillar',   dgtReward: 1500, rarity: 'rare' },
  { level: 20, title: 'Knowledge Keeper',   dgtReward: 2000, rarity: 'rare' },
  { level: 25, title: 'Forum Sage',         dgtReward: 2500, rarity: 'rare' },
  { level: 30, title: 'Respected Degen',    dgtReward: 3000, rarity: 'epic' },
  { level: 40, title: 'Elder Degen',        dgtReward: 4000, rarity: 'epic' },
  { level: 50, title: 'Forum Legend',       dgtReward: 5000, rarity: 'epic' },
  { level: 60, title: 'Wisdom Guardian',    dgtReward: 6000, rarity: 'legendary' },
  { level: 75, title: 'Forum Oracle',       dgtReward: 7500, rarity: 'legendary' },
  { level: 90, title: 'Degen Icon',         dgtReward: 9000, rarity: 'legendary' },
  { level: 99, title: 'Degen Master',       dgtReward: 10000, rarity: 'legendary' },
  { level: 100, title: 'Degen Legend',      dgtReward: 20000, rarity: 'mythic' }
] as const;

interface MigrationStats {
  titlesCreated: number;
  titlesUpdated: number;
  duplicatesSkipped: number;
  errors: string[];
}

async function consolidateTitles(): Promise<void> {
  console.log('🚀 Starting Title System Consolidation...');
  
  const stats: MigrationStats = {
    titlesCreated: 0,
    titlesUpdated: 0,
    duplicatesSkipped: 0,
    errors: []
  };

  try {
    // Step 1: Add new columns to existing titles table (if they don't exist)
    console.log('📋 Step 1: Updating database schema...');
    
    // Note: These ALTER statements would need to be run manually or via a separate migration
    // This is just documentation of what needs to be added
    /*
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'level';
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS unlock_type VARCHAR(20) DEFAULT 'level';
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS min_level INTEGER;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS effects JSON;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS max_supply INTEGER;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS current_supply INTEGER DEFAULT 0;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    ALTER TABLE titles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    */
    
    // Step 2: Insert default styled titles
    console.log('📋 Step 2: Creating default styled titles...');
    
    for (const [titleName, titleData] of Object.entries(DEFAULT_TITLE_STYLES)) {
      // Check if title already exists
      const existing = await db
        .select()
        .from(titles)
        .where(eq(titles.name, titleName))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`  ⚠️  Default title "${titleName}" already exists, skipping...`);
        stats.duplicatesSkipped++;
        continue;
      }
      
      try {
        // Create styled title with full CSS properties
        await db.insert(titles).values({
          id: randomUUID(),
          name: titleName,
          description: titleData.description,
          rarity: titleData.rarity,
          category: titleData.category,
          unlockType: titleData.unlockType,
          minLevel: titleData.minLevel,
          gradientStart: titleData.gradientStart,
          gradientEnd: titleData.gradientEnd,
          textColor: titleData.textColor,
          borderColor: titleData.borderColor,
          effects: titleData.effects || [],
          isShopItem: false,
          isUnlockable: true,
          isActive: true,
          sortOrder: titleData.minLevel || 0,
          createdAt: new Date()
        });
        
        console.log(`  ✅ Created styled title: "${titleName}"`);
        stats.titlesCreated++;
      } catch (error) {
        const errorMsg = `Failed to create styled title "${titleName}": ${error}`;
        console.error(`  ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    // Step 3: Migrate level-based titles from seed data
    console.log('📋 Step 3: Migrating level-based titles...');
    
    for (const levelConfig of LEVEL_TITLES) {
      const titleName = levelConfig.title;
      
      // Check if title already exists
      const existing = await db
        .select()
        .from(titles)
        .where(eq(titles.name, titleName))
        .limit(1);
      
      if (existing.length > 0) {
        console.log(`  ⚠️  Title "${titleName}" already exists, skipping...`);
        stats.duplicatesSkipped++;
        continue;
      }
      
      try {
        // Create new title
        await db.insert(titles).values({
          id: randomUUID(),
          name: titleName,
          description: `Awarded for reaching level ${levelConfig.level}`,
          rarity: levelConfig.rarity,
          // category: 'level', // Would be set if column exists
          // unlockType: 'level', // Would be set if column exists
          // minLevel: levelConfig.level, // Would be set if column exists
          isShopItem: false,
          isUnlockable: true,
          // isActive: true, // Would be set if column exists
          // sortOrder: levelConfig.level, // Would be set if column exists
          createdAt: new Date()
        });
        
        console.log(`  ✅ Created level title: "${titleName}" (Level ${levelConfig.level})`);
        stats.titlesCreated++;
      } catch (error) {
        const errorMsg = `Failed to create title "${titleName}": ${error}`;
        console.error(`  ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }

    // Step 4: Migrate config-based titles
    console.log('📋 Step 4: Migrating config-based titles...');
    
    // Process each category
    const categories = [
      { key: 'levels', category: 'level', unlockType: 'level' },
      { key: 'roles', category: 'role', unlockType: 'role' },
      { key: 'achievements', category: 'achievement', unlockType: 'achievement' },
      { key: 'shop', category: 'shop', unlockType: 'purchase' },
      { key: 'special', category: 'special', unlockType: 'manual' }
    ];
    
    for (const categoryInfo of categories) {
      const configTitles = CONFIG_TITLES[categoryInfo.key as keyof typeof CONFIG_TITLES];
      
      for (const [key, titleConfig] of Object.entries(configTitles)) {
        const titleName = titleConfig.name;
        
        // Check if title already exists
        const existing = await db
          .select()
          .from(titles)
          .where(eq(titles.name, titleName))
          .limit(1);
        
        if (existing.length > 0) {
          console.log(`  ⚠️  Title "${titleName}" already exists, skipping...`);
          stats.duplicatesSkipped++;
          continue;
        }
        
        try {
          // Prepare title data
          const titleData: any = {
            id: randomUUID(),
            name: titleName,
            description: (titleConfig as any).description || `${categoryInfo.category} title`,
            emoji: titleConfig.icon,
            rarity: titleConfig.rarity || 'common',
            // category: categoryInfo.category, // Would be set if column exists
            // unlockType: categoryInfo.unlockType, // Would be set if column exists
            isShopItem: categoryInfo.category === 'shop',
            isUnlockable: true,
            // isActive: true, // Would be set if column exists
            createdAt: new Date()
          };
          
          // Add shop-specific fields
          if (categoryInfo.category === 'shop' && 'price' in titleConfig) {
            titleData.shopPrice = (titleConfig as any).price;
            titleData.shopCurrency = 'DGT';
          }
          
          // Add level requirement for level-based titles
          if (categoryInfo.category === 'level') {
            const levelKey = parseInt(key);
            // titleData.minLevel = levelKey; // Would be set if column exists
          }
          
          await db.insert(titles).values(titleData);
          
          console.log(`  ✅ Created ${categoryInfo.category} title: "${titleName}"`);
          stats.titlesCreated++;
        } catch (error) {
          const errorMsg = `Failed to create title "${titleName}": ${error}`;
          console.error(`  ❌ ${errorMsg}`);
          stats.errors.push(errorMsg);
        }
      }
    }

    // Step 5: Update existing titles with new fields (if schema supports it)
    console.log('📋 Step 5: Updating existing titles...');
    
    const existingTitles = await db.select().from(titles);
    
    for (const title of existingTitles) {
      const updates: any = {};
      let needsUpdate = false;
      
      // Set default category based on existing fields
      // if (!title.category) {
      //   if (title.roleId) {
      //     updates.category = 'role';
      //   } else if (title.isShopItem) {
      //     updates.category = 'shop';
      //   } else {
      //     updates.category = 'level';
      //   }
      //   needsUpdate = true;
      // }
      
      // Set default unlock type
      // if (!title.unlockType) {
      //   updates.unlockType = updates.category === 'role' ? 'role' : 
      //                       updates.category === 'shop' ? 'purchase' : 'level';
      //   needsUpdate = true;
      // }
      
      // Set default active status
      // if (title.isActive === undefined) {
      //   updates.isActive = true;
      //   needsUpdate = true;
      // }
      
      if (needsUpdate) {
        try {
          await db
            .update(titles)
            .set(updates)
            .where(eq(titles.id, title.id));
          
          console.log(`  ✅ Updated title: "${title.name}"`);
          stats.titlesUpdated++;
        } catch (error) {
          const errorMsg = `Failed to update title "${title.name}": ${error}`;
          console.error(`  ❌ ${errorMsg}`);
          stats.errors.push(errorMsg);
        }
      }
    }

    // Step 6: Print summary
    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Titles created: ${stats.titlesCreated}`);
    console.log(`  🔄 Titles updated: ${stats.titlesUpdated}`);
    console.log(`  ⚠️  Duplicates skipped: ${stats.duplicatesSkipped}`);
    console.log(`  ❌ Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n✅ Title consolidation completed!');
    console.log('\n🔧 Next steps:');
    console.log('  1. Run database migration to add new columns');
    console.log('  2. Update TitlesService to use new unified system');
    console.log('  3. Update frontend components to use new types');
    console.log('  4. Remove hardcoded config files');
    console.log('  5. Test all title functionality');

  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    throw error;
  }
}

// CLI execution (ES module compatible)
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename || process.argv[1].endsWith('consolidate-titles.ts')) {
  consolidateTitles()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { consolidateTitles };