import type { AdminId } from '@shared/types/ids';
#!/usr/bin/env tsx

/**
 * Clean Slate Schema Cleanup
 * 
 * Removes all old forum_categories references to establish forum_structure
 * as the single source of truth. Safe for development environment.
 */

import { db } from '../../db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

interface CleanupStep {
  name: : AdminId;
  query: : AdminId;
  rollback?: : AdminId;
}

const cleanupSteps: CleanupStep[] = [
  {
    name: 'Drop threads.category_id foreign key constraint',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'threads_category_id_forum_categories_id_fk'
        ) THEN
          ALTER TABLE "threads" DROP CONSTRAINT "threads_category_id_forum_categories_id_fk";
        END IF;
      END $$;
    `
  },
  {
    name: 'Drop thread_prefixes.category_id foreign key constraint',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'thread_prefixes_category_id_forum_categories_id_fk'
        ) THEN
          ALTER TABLE "thread_prefixes" DROP CONSTRAINT "thread_prefixes_category_id_forum_categories_id_fk";
        END IF;
      END $$;
    `
  },
  {
    name: 'Drop thread_drafts.category_id foreign key constraint',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'thread_drafts_category_id_forum_categories_id_fk'
        ) THEN
          ALTER TABLE "thread_drafts" DROP CONSTRAINT "thread_drafts_category_id_forum_categories_id_fk";
        END IF;
      END $$;
    `
  },
  {
    name: 'Drop threads.category_id column',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'threads' AND column_name = 'category_id'
        ) THEN
          ALTER TABLE "threads" DROP COLUMN "category_id";
        END IF;
      END $$;
    `
  },
  {
    name: 'Drop thread_prefixes.category_id column',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'thread_prefixes' AND column_name = 'category_id'
        ) THEN
          ALTER TABLE "thread_prefixes" DROP COLUMN "category_id";
        END IF;
      END $$;
    `
  },
  {
    name: 'Drop thread_drafts.category_id column',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'thread_drafts' AND column_name = 'category_id'
        ) THEN
          ALTER TABLE "thread_drafts" DROP COLUMN "category_id";
        END IF;
      END $$;
    `
  },
  {
    name: 'Drop idx_threads_category_id index',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'idx_threads_category_id'
        ) THEN
          DROP INDEX "idx_threads_category_id";
        END IF;
      END $$;
    `
  },
  {
    name: 'Drop forum_categories table',
    query: `
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'forum_categories'
        ) THEN
          DROP TABLE "forum_categories" CASCADE;
        END IF;
      END $$;
    `
  }
];

async function validateCleanup(): Promise<boolean> {
  try {
    console.log(chalk.cyan('Validating schema cleanup...'));
    
    // Check that forum_categories table is gone
    const categoriesTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'forum_categories'
      );
    `);
    
    if (categoriesTableExists.rows[0]?.exists) {
      console.log(chalk.red('❌ forum_categories table still exists'));
      return false;
    }
    
    // Check that category_id columns are gone
    const categoryIdColumns = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'category_id' 
      AND table_name IN ('threads', 'thread_prefixes', 'thread_drafts');
    `);
    
    if (categoryIdColumns.rows.length > 0) {
      console.log(chalk.red(`❌ category_id columns still exist in: ${categoryIdColumns.rows.map(r => r.table_name).join(', ')}`));
      return false;
    }
    
    // Check that forum_structure table still exists
    const structureTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'forum_structure'
      );
    `);
    
    if (!structureTableExists.rows[0]?.exists) {
      console.log(chalk.red('❌ forum_structure table missing!'));
      return false;
    }
    
    // Check that structure_id columns exist
    const structureIdColumns = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'structure_id' 
      AND table_name IN ('threads', 'thread_prefixes', 'thread_drafts');
    `);
    
    if (structureIdColumns.rows.length !== 3) {
      console.log(chalk.red(`❌ structure_id columns missing. Found: ${structureIdColumns.rows.map(r => r.table_name).join(', ')}`));
      return false;
    }
    
    console.log(chalk.green('✅ Schema cleanup validation passed'));
    return true;
    
  } catch (error) {
    console.error(chalk.red('Schema cleanup validation failed:'), error);
    return false;
  }
}

async function runCleanup() {
  console.log(chalk.blue('🧹 Starting Clean Slate Schema Cleanup'));
  console.log(chalk.gray('Removing all forum_categories references to establish single source of truth\n'));
  
  let completedSteps = 0;
  
  try {
    for (const step of cleanupSteps) {
      console.log(chalk.cyan(`📝 ${step.name}...`));
      
      try {
        await db.execute(sql.raw(step.query));
        console.log(chalk.green(`✅ ${step.name} completed`));
        completedSteps++;
      } catch (error) {
        console.error(chalk.red(`❌ ${step.name} failed:`), error);
        throw error;
      }
    }
    
    console.log(chalk.blue('\n🔍 Validating cleanup...'));
    const isValid = await validateCleanup();
    
    if (isValid) {
      console.log(chalk.green('\n🎉 Clean Slate Schema Cleanup completed successfully!'));
      console.log(chalk.gray('✅ forum_categories table removed'));
      console.log(chalk.gray('✅ category_id columns removed'));
      console.log(chalk.gray('✅ forum_structure is now single source of truth'));
      console.log(chalk.gray('\nNext: Update backend services to use ForumStructureService'));
    } else {
      console.log(chalk.red('\n❌ Schema cleanup validation failed'));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red('\n💥 Schema cleanup failed:'), error);
    console.log(chalk.yellow(`\nCompleted ${completedSteps}/${cleanupSteps.length} steps`));
    console.log(chalk.gray('You may need to manually check the database state'));
    process.exit(1);
  }
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCleanup().catch(console.error);
}

export { runCleanup, validateCleanup };