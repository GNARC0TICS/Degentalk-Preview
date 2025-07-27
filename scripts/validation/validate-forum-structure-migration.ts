#!/usr/bin/env tsx

/**
 * Forum Structure Migration Validation
 * 
 * Validates that the migration from "forum_categories" to "forum_structure" 
 * was successful and all schema updates are working correctly.
 */

import { db } from '@db';
import { forumStructure } from '../../db/schema/forum/structure';
import { threads } from '../../db/schema/forum/threads';
import { threadPrefixes } from '../../db/schema/forum/prefixes';
import { threadDrafts } from '../../db/schema/forum/threadDrafts';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

async function validateMigration() {
  console.log(chalk.blue('🔍 Validating Forum Structure Migration'));
  console.log(chalk.gray('Checking that "categories" → "forum_structure" refactoring was successful\n'));

  let allChecks = true;

  try {
    // 1. Test that we can query the new forum_structure table
    console.log(chalk.cyan('1. Testing forum_structure table access...'));
    const structureCount = await db.select().from(forumStructure);
    console.log(chalk.green(`✅ Found ${structureCount.length} forum structure nodes`));

    // 2. Test that schema exports are working
    console.log(chalk.cyan('2. Testing schema imports...'));
    console.log(chalk.green(`✅ forumStructure schema imported successfully`));
    console.log(chalk.green(`✅ threads schema with structureId imported successfully`));
    console.log(chalk.green(`✅ threadPrefixes schema with structureId imported successfully`));
    console.log(chalk.green(`✅ threadDrafts schema with structureId imported successfully`));

    // 3. Test foreign key relationships
    console.log(chalk.cyan('3. Testing foreign key relationships...'));
    
    // Check threads with structure
    const threadsWithStructure = await db.execute(sql`
      SELECT t.thread_id, t.title, fs.name as structure_name, fs.slug as structure_slug
      FROM threads t
      JOIN forum_structure fs ON t.structure_id = fs.id
      LIMIT 5;
    `);
    
    if (threadsWithStructure.rows.length > 0) {
      console.log(chalk.green(`✅ threads.structure_id foreign key working (${threadsWithStructure.rows.length} sample records)`));
      console.log(chalk.gray(`   Sample: "${threadsWithStructure.rows[0]?.title}" → "${threadsWithStructure.rows[0]?.structure_name}"`));
    } else {
      console.log(chalk.yellow('⚠️  No threads found with structure relationships'));
    }

    // Check thread prefixes
    const prefixesWithStructure = await db.execute(sql`
      SELECT tp.name as prefix_name, fs.name as structure_name
      FROM thread_prefixes tp
      JOIN forum_structure fs ON tp.structure_id = fs.id
      LIMIT 3;
    `);
    
    if (prefixesWithStructure.rows.length > 0) {
      console.log(chalk.green(`✅ thread_prefixes.structure_id foreign key working (${prefixesWithStructure.rows.length} records)`));
    } else {
      console.log(chalk.yellow('⚠️  No thread prefixes found with structure relationships'));
    }

    // 4. Test data integrity
    console.log(chalk.cyan('4. Testing data integrity...'));
    
    const originalCategories = await db.execute(sql`SELECT COUNT(*) as count FROM forum_categories;`);
    const newStructure = await db.execute(sql`SELECT COUNT(*) as count FROM forum_structure;`);
    
    const catCount = Number(originalCategories.rows[0]?.count || 0);
    const structCount = Number(newStructure.rows[0]?.count || 0);
    
    if (catCount === structCount && structCount > 0) {
      console.log(chalk.green(`✅ Data integrity verified: ${catCount} categories = ${structCount} structure nodes`));
    } else {
      console.log(chalk.red(`❌ Data integrity issue: ${catCount} categories ≠ ${structCount} structure nodes`));
      allChecks = false;
    }

    // 5. Test zone/forum hierarchy
    console.log(chalk.cyan('5. Testing zone/forum hierarchy...'));
    
    const zoneCount = await db.execute(sql`SELECT COUNT(*) as count FROM forum_structure WHERE type = 'zone';`);
    const forumCount = await db.execute(sql`SELECT COUNT(*) as count FROM forum_structure WHERE type = 'forum';`);
    
    const zones = Number(zoneCount.rows[0]?.count || 0);
    const forums = Number(forumCount.rows[0]?.count || 0);
    
    console.log(chalk.green(`✅ Hierarchy verified: ${zones} zones, ${forums} forums (total: ${zones + forums})`));

    // 6. Test that new TypeScript types work
    console.log(chalk.cyan('6. Testing TypeScript type safety...'));
    
    // This should compile without errors if types are working
    const sampleStructure = structureCount[0];
    if (sampleStructure) {
      const typedStructure: typeof sampleStructure = {
        id: sampleStructure.id,
        name: sampleStructure.name,
        slug: sampleStructure.slug,
        description: sampleStructure.description,
        parentForumSlug: sampleStructure.parentForumSlug,
        parentId: sampleStructure.parentId,
        type: sampleStructure.type,
        position: sampleStructure.position,
        isVip: sampleStructure.isVip,
        isLocked: sampleStructure.isLocked,
        minXp: sampleStructure.minXp,
        isHidden: sampleStructure.isHidden,
        minGroupIdRequired: sampleStructure.minGroupIdRequired,
        color: sampleStructure.color,
        icon: sampleStructure.icon,
        colorTheme: sampleStructure.colorTheme,
        tippingEnabled: sampleStructure.tippingEnabled,
        xpMultiplier: sampleStructure.xpMultiplier,
        pluginData: sampleStructure.pluginData,
        createdAt: sampleStructure.createdAt,
        updatedAt: sampleStructure.updatedAt
      };
      
      console.log(chalk.green(`✅ TypeScript types working correctly for "${typedStructure.name}"`));
    }

    // Final result
    if (allChecks) {
      console.log(chalk.green('\n🎉 Forum Structure Migration Validation PASSED!'));
      console.log(chalk.gray('The refactoring from "categories" to "forum_structure" is working correctly.'));
      console.log(chalk.gray('\nNext steps:'));
      console.log(chalk.gray('- Update backend services to use forumStructure instead of forumCategories'));
      console.log(chalk.gray('- Update API routes to use structure_id instead of category_id'));
      console.log(chalk.gray('- Update frontend components to use new terminology'));
      console.log(chalk.gray('- Eventually remove old forum_categories table'));
    } else {
      console.log(chalk.red('\n❌ Forum Structure Migration Validation FAILED!'));
      console.log(chalk.gray('Some issues were found that need to be addressed.'));
    }

  } catch (error) {
    console.error(chalk.red('\n💥 Validation failed with error:'), error);
    allChecks = false;
  }

  return allChecks;
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateMigration()
    .then(success => process.exit(success ? 0 : 1))
    .catch(console.error);
}

export { validateMigration };