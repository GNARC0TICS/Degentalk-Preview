#!/usr/bin/env tsx
/**
 * seedForumsFromConfig.ts - Sync ForumMapConfig to database
 * Populates forum_structure table with zones and forums from config
 */

import { db } from '../../db/index.js';
import { forumStructure } from '../../db/schema/forum/structure.js';
import { forumMap } from '../../shared/config/forum-map.config.js';
import type { RootForum as Zone, Forum } from '../../shared/config/forum-map.config.js';
import { eq } from 'drizzle-orm';

interface DbStructure {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'forum'; // Updated: no more 'zone' type
  parentId: string | null;
  parentForumSlug: string | null;
  position: number; // Updated: renamed from sortOrder
  isLocked: boolean;
  tippingEnabled: boolean;
  xpMultiplier: number;
  color: string;
  icon: string;
  colorTheme: string | null;
  isFeatured: boolean; // Added: featured forum flag
  themePreset: string | null; // Added: theme preset
  pluginData: any;
  createdAt: Date;
  updatedAt: Date;
}

export async function seedForumsFromConfig() {
  console.log('🌱 Starting forum seeding from config...');
  
  try {
    // Clear existing structures
    await db.delete(forumStructure);
    console.log('✅ Cleared existing forum structures');
    
    const insertedStructures: DbStructure[] = [];
    
    // Process each top-level forum from config
    for (const [forumIndex, forum] of forumMap.forums.entries()) {
      console.log(`🏛️ Processing top-level forum: ${forum.name} (${forum.slug})`);
      
      // Insert top-level forum
      const forumData: Omit<DbStructure, 'id'> = {
        name: forum.name,
        slug: forum.slug,
        description: forum.description || null,
        type: 'forum',
        parentId: null,
        parentForumSlug: null,
        position: forum.position || forumIndex,
        isLocked: false,
        tippingEnabled: forum.defaultRules?.tippingEnabled || false,
        xpMultiplier: forum.defaultRules?.xpMultiplier || 1,
        color: forum.theme.color || '#9CA3AF',
        icon: forum.theme.icon || '📁',
        colorTheme: forum.theme.colorTheme || null,
        isFeatured: forum.isFeatured || false, // Set from config
        themePreset: forum.theme.colorTheme || null, // Use colorTheme as preset
        pluginData: {
          configDescription: forum.description,
          originalTheme: forum.theme,
          bannerImage: forum.theme.bannerImage,
          landingComponent: forum.theme.landingComponent,
          isFeatured: forum.isFeatured || false // Also store in pluginData for compatibility
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [insertedForum] = await db.insert(forumStructure).values(forumData).returning();
      insertedStructures.push(insertedForum);
      
      if (forum.isFeatured) {
        console.log(`  ✨ Featured forum inserted: ${forum.name} (ID: ${insertedForum.id})`);
      } else {
        console.log(`  📁 Regular forum inserted: ${forum.name} (ID: ${insertedForum.id})`);
      }
      
      // Process subforums in this top-level forum
      if (forum.forums && forum.forums.length > 0) {
        await processForums(forum.forums, insertedForum.id, forum.slug, insertedStructures);
      }
    }
    
    console.log(`🎉 Successfully seeded ${insertedStructures.length} forum structures`);
    console.log('📊 Summary:');
    console.log(`  - Featured forums: ${insertedStructures.filter(s => s.isFeatured).length}`);
    console.log(`  - Regular forums: ${insertedStructures.filter(s => !s.isFeatured && !s.parentId).length}`);
    console.log(`  - Subforums: ${insertedStructures.filter(s => s.parentId).length}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function processForums(
  forums: Forum[], 
  parentId: string, 
  parentSlug: string, 
  insertedStructures: DbStructure[]
) {
  for (const [forumIndex, forum] of forums.entries()) {
    console.log(`  📝 Processing subforum: ${forum.name} (${forum.slug})`);
    
    const forumData: Omit<DbStructure, 'id'> = {
      name: forum.name,
      slug: forum.slug,
      description: forum.description || null,
      type: 'forum',
      parentId: parentId,
      parentForumSlug: parentSlug,
      position: forum.position || forumIndex,
      isLocked: !forum.rules.allowPosting,
      tippingEnabled: forum.rules.tippingEnabled,
      xpMultiplier: forum.rules.xpMultiplier || 1,
      color: forum.themeOverride?.color || '#9CA3AF',
      icon: forum.themeOverride?.icon || '📄',
      colorTheme: forum.themeOverride?.colorTheme || null,
      isFeatured: false, // Subforums are never featured
      themePreset: null, // Subforums don't have theme presets
      pluginData: {
        rules: forum.rules,
        themeOverride: forum.themeOverride || null,
        availablePrefixes: forum.rules.availablePrefixes || [],
        customComponent: forum.rules.customComponent || null,
        customRules: forum.rules.customRules || {},
        isFeatured: false // Ensure subforums are not featured
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [insertedForum] = await db.insert(forumStructure).values(forumData).returning();
    insertedStructures.push(insertedForum);
    console.log(`    ✅ Subforum inserted: ${forum.name} (ID: ${insertedForum.id})`);
    
    // Process nested subforums if they exist
    if (forum.forums && forum.forums.length > 0) {
      console.log(`    📁 Processing ${forum.forums.length} nested subforums...`);
      await processForums(forum.forums, insertedForum.id, forum.slug, insertedStructures);
    }
  }
}

// Export for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  seedForumsFromConfig();
}