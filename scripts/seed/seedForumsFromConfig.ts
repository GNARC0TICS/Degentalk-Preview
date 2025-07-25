#!/usr/bin/env tsx
/**
 * seedForumsFromConfig.ts - Sync ForumMapConfig to database
 * Populates forum_structure table with zones and forums from config
 */

import { db } from '../../db';
import { forumStructure } from '../../db/schema/forum/structure';
import { forumMap } from '@config/forumMap';
import type { RootForum as Zone, Forum } from '@config/forumMap';
import { eq } from 'drizzle-orm';

interface DbStructure {
  id?: number;
  name: string;
  slug: string;
  description: string | null;
  type: 'zone' | 'forum';
  parentId: number | null;
  parentForumSlug: string | null;
  sortOrder: number;
  isLocked: boolean;
  tippingEnabled: boolean;
  xpMultiplier: number;
  color: string;
  icon: string;
  colorTheme: string | null;
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
    
    // Process each zone from config
    for (const [zoneIndex, zone] of forumMap.forums.entries()) {
      console.log(`📁 Processing zone: ${zone.name} (${zone.slug})`);
      
      // Insert zone
      const zoneData: Omit<DbStructure, 'id'> = {
        name: zone.name,
        slug: zone.slug,
        description: zone.description || null,
        type: 'zone',
        parentId: null,
        parentForumSlug: null,
        sortOrder: zone.position || zoneIndex,
        isLocked: false,
        tippingEnabled: false,
        xpMultiplier: 1,
        color: zone.theme.color || '#9CA3AF',
        icon: zone.theme.icon || '📁',
        colorTheme: zone.theme.colorTheme || null,
        pluginData: {
          configDescription: zone.description,
          configZoneType: zone.type,
          originalTheme: zone.theme,
          bannerImage: zone.theme.bannerImage,
          landingComponent: zone.theme.landingComponent
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [insertedZone] = await db.insert(forumStructure).values(zoneData).returning();
      insertedStructures.push(insertedZone);
      console.log(`  ✅ Zone inserted: ${zone.name} (ID: ${insertedZone.id})`);
      
      // Process forums in this zone
      await processForums(zone.forums, insertedZone.id, zone.slug, insertedStructures);
    }
    
    console.log(`🎉 Successfully seeded ${insertedStructures.length} forum structures`);
    console.log('📊 Summary:');
    console.log(`  - Zones: ${insertedStructures.filter(s => s.type === 'zone').length}`);
    console.log(`  - Forums: ${insertedStructures.filter(s => s.type === 'forum').length}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function processForums(
  forums: Forum[], 
  parentId: number, 
  parentSlug: string, 
  insertedStructures: DbStructure[]
) {
  for (const [forumIndex, forum] of forums.entries()) {
    console.log(`  📝 Processing forum: ${forum.name} (${forum.slug})`);
    
    // Determine parent forum slug (for subforums)
    const isSubforum = parentSlug !== parentSlug; // Will be true for subforums
    
    const forumData: Omit<DbStructure, 'id'> = {
      name: forum.name,
      slug: forum.slug,
      description: forum.description || null,
      type: 'forum',
      parentId: parentId,
      parentForumSlug: isSubforum ? parentSlug : null,
      sortOrder: forum.position || forumIndex,
      isLocked: !forum.rules.allowPosting,
      tippingEnabled: forum.rules.tippingEnabled,
      xpMultiplier: forum.rules.xpMultiplier || 1,
      color: forum.themeOverride?.color || '#9CA3AF',
      icon: forum.themeOverride?.icon || '📄',
      colorTheme: forum.themeOverride?.colorTheme || null,
      pluginData: {
        rules: forum.rules,
        themeOverride: forum.themeOverride || null,
        availablePrefixes: forum.rules.availablePrefixes || [],
        customComponent: forum.rules.customComponent || null,
        customRules: forum.rules.customRules || {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [insertedForum] = await db.insert(forumStructure).values(forumData).returning();
    insertedStructures.push(insertedForum);
    console.log(`    ✅ Forum inserted: ${forum.name} (ID: ${insertedForum.id})`);
    
    // Process subforums if they exist
    if (forum.forums && forum.forums.length > 0) {
      console.log(`    📁 Processing ${forum.forums.length} subforums...`);
      await processForums(forum.forums, insertedForum.id, forum.slug, insertedStructures);
    }
  }
}

// Export for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  seedForumsFromConfig();
}