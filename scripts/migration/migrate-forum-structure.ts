import type { HeatEventId } from '@shared/types/ids';
import type { ActionId } from '@shared/types/ids';
import type { AuditLogId } from '@shared/types/ids';
import type { EventId } from '@shared/types/ids';
import type { PrefixId } from '@shared/types/ids';
import type { MessageId } from '@shared/types/ids';
import type { FollowRequestId } from '@shared/types/ids';
import type { FriendRequestId } from '@shared/types/ids';
import type { NotificationId } from '@shared/types/ids';
import type { UnlockId } from '@shared/types/ids';
import type { StoreItemId } from '@shared/types/ids';
import type { OrderId } from '@shared/types/ids';
import type { QuoteId } from '@shared/types/ids';
import type { ReplyId } from '@shared/types/ids';
import type { DraftId } from '@shared/types/ids';
import type { IpLogId } from '@shared/types/ids';
import type { ModActionId } from '@shared/types/ids';
import type { SessionId } from '@shared/types/ids';
import type { BanId } from '@shared/types/ids';
import type { VerificationTokenId } from '@shared/types/ids';
import type { SignatureItemId } from '@shared/types/ids';
import type { ContentId } from '@shared/types/ids';
import type { RequestId } from '@shared/types/ids';
import type { ZoneId } from '@shared/types/ids';
import type { WhaleId } from '@shared/types/ids';
import type { VaultLockId } from '@shared/types/ids';
import type { VaultId } from '@shared/types/ids';
import type { UnlockTransactionId } from '@shared/types/ids';
import type { TipId } from '@shared/types/ids';
import type { TemplateId } from '@shared/types/ids';
import type { TagId } from '@shared/types/ids';
import type { SubscriptionId } from '@shared/types/ids';
import type { StickerId } from '@shared/types/ids';
import type { SettingId } from '@shared/types/ids';
import type { RuleId } from '@shared/types/ids';
import type { ParentZoneId } from '@shared/types/ids';
import type { ParentForumId } from '@shared/types/ids';
import type { PackId } from '@shared/types/ids';
import type { ModeratorId } from '@shared/types/ids';
import type { MentionId } from '@shared/types/ids';
import type { ItemId } from '@shared/types/ids';
import type { InventoryId } from '@shared/types/ids';
import type { GroupId } from '@shared/types/ids';
import type { ForumId } from '@shared/types/ids';
import type { EntryId } from '@shared/types/ids';
import type { EntityId } from '@shared/types/ids';
import type { EmojiPackId } from '@shared/types/ids';
import type { EditorId } from '@shared/types/ids';
import type { CosmeticId } from '@shared/types/ids';
import type { AuthorId } from '@shared/types/ids';
import type { CoinId } from '@shared/types/ids';
import type { CategoryId } from '@shared/types/ids';
import type { BackupId } from '@shared/types/ids';
import type { AnimationFrameId } from '@shared/types/ids';
import type { AirdropId } from '@shared/types/ids';
import type { AdminUserId } from '@shared/types/ids';
import type { RoomId } from '@shared/types/ids';
import type { ConversationId } from '@shared/types/ids';
import type { ReportId } from '@shared/types/ids';
import type { ReporterId } from '@shared/types/ids';
import type { AdminId } from '@shared/types/ids';
#!/usr/bin/env tsx

/**
 * Forum Structure Migration Script
 * 
 * This script migrates from the confusing "forum_categories" table to the clearer
 * "forum_structure" table as part of the terminology refactoring.
 * 
 * Phase 1: Database Schema Migration
 * - Creates new forum_structure table
 * - Copies all data from forum_categories (preserving IDs)
 * - Adds new structure_id columns to referencing tables
 * - Creates foreign key constraints
 */

import { db } from '@db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

interface MigrationStep {
  name: : AdminId;
  query: : AdminId;
  rollback?: : AdminId;
}

const migrationSteps: MigrationStep[] = [
  {
    name: 'Create forum_structure table',
    query: `
      CREATE TABLE IF NOT EXISTS "forum_structure" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "description" text,
        "parent_forum_slug" text,
        "parent_id" integer,
        "type" text DEFAULT 'forum' NOT NULL,
        "position" integer DEFAULT 0 NOT NULL,
        "is_vip" boolean DEFAULT false NOT NULL,
        "is_locked" boolean DEFAULT false NOT NULL,
        "min_xp" integer DEFAULT 0 NOT NULL,
        "is_hidden" boolean DEFAULT false NOT NULL,
        "min_group_id_required" integer,
        "color" text DEFAULT 'gray' NOT NULL,
        "icon" text DEFAULT 'hash' NOT NULL,
        "color_theme" text,
        "tipping_enabled" boolean DEFAULT false NOT NULL,
        "xp_multiplier" real DEFAULT 1 NOT NULL,
        "plugin_data" jsonb DEFAULT '{}',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "forum_structure_slug_unique" UNIQUE("slug")
      );
    `,
    rollback: 'DROP TABLE IF EXISTS "forum_structure";'
  },
  {
    name: 'Add foreign key constraints for forum_structure',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'forum_structure_parent_id_forum_structure_id_fk'
        ) THEN
          ALTER TABLE "forum_structure" 
          ADD CONSTRAINT "forum_structure_parent_id_forum_structure_id_fk" 
          FOREIGN KEY ("parent_id") REFERENCES "public"."forum_structure"("id") 
          ON DELETE set : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null ON UPDATE no action;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add user groups foreign key constraint',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'forum_structure_min_group_id_required_roles_role_id_fk'
        ) THEN
          ALTER TABLE "forum_structure" 
          ADD CONSTRAINT "forum_structure_min_group_id_required_roles_role_id_fk" 
          FOREIGN KEY ("min_group_id_required") REFERENCES "public"."roles"("role_id") 
          ON DELETE set : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null ON UPDATE no action;
        END IF;
      END $$;
    `
  },
  {
    name: 'Copy data from forum_categories to forum_structure',
    query: `
      INSERT INTO "forum_structure" (
        "id", "name", "slug", "description", "parent_forum_slug", "parent_id", "type", "position",
        "is_vip", "is_locked", "min_xp", "is_hidden", "min_group_id_required", "color", "icon", 
        "color_theme", "tipping_enabled", "xp_multiplier", "plugin_data", "created_at", "updated_at"
      )
      SELECT 
        "category_id", "name", "slug", "description", "parent_forum_slug", "parent_id", "type", "position",
        "is_vip", "is_locked", "min_xp", "is_hidden", "min_group_id_required", "color", "icon",
        "color_theme", "tipping_enabled", "xp_multiplier", "plugin_data", "created_at", "updated_at"
      FROM "forum_categories"
      WHERE NOT EXISTS (SELECT 1 FROM "forum_structure" WHERE "slug" = "forum_categories"."slug")
      ORDER BY "category_id";
    `
  },
  {
    name: 'Update forum_structure sequence',
    query: `
      SELECT setval('forum_structure_id_seq', (SELECT COALESCE(MAX(id), 1) FROM "forum_structure"));
    `
  },
  {
    name: 'Add structure_id column to threads table',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'threads' AND column_name = 'structure_id'
        ) THEN
          ALTER TABLE "threads" ADD COLUMN "structure_id" integer;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add structure_id column to thread_prefixes table',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'thread_prefixes' AND column_name = 'structure_id'
        ) THEN
          ALTER TABLE "thread_prefixes" ADD COLUMN "structure_id" integer;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add structure_id column to thread_drafts table',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'thread_drafts' AND column_name = 'structure_id'
        ) THEN
          ALTER TABLE "thread_drafts" ADD COLUMN "structure_id" integer;
        END IF;
      END $$;
    `
  },
  {
    name: 'Copy foreign key references to threads.structure_id',
    query: `
      UPDATE "threads" 
      SET "structure_id" = "category_id" 
      WHERE "structure_id" IS NULL AND "category_id" IS NOT NULL;
    `
  },
  {
    name: 'Copy foreign key references to thread_prefixes.structure_id',
    query: `
      UPDATE "thread_prefixes" 
      SET "structure_id" = "category_id" 
      WHERE "structure_id" IS NULL AND "category_id" IS NOT NULL;
    `
  },
  {
    name: 'Copy foreign key references to thread_drafts.structure_id',
    query: `
      UPDATE "thread_drafts" 
      SET "structure_id" = "category_id" 
      WHERE "structure_id" IS NULL AND "category_id" IS NOT NULL;
    `
  },
  {
    name: 'Add foreign key constraint for threads.structure_id',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'threads_structure_id_forum_structure_id_fk'
        ) THEN
          ALTER TABLE "threads" 
          ADD CONSTRAINT "threads_structure_id_forum_structure_id_fk" 
          FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") 
          ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add foreign key constraint for thread_prefixes.structure_id',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'thread_prefixes_structure_id_forum_structure_id_fk'
        ) THEN
          ALTER TABLE "thread_prefixes" 
          ADD CONSTRAINT "thread_prefixes_structure_id_forum_structure_id_fk" 
          FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") 
          ON DELETE set : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null ON UPDATE no action;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add foreign key constraint for thread_drafts.structure_id',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'thread_drafts_structure_id_forum_structure_id_fk'
        ) THEN
          ALTER TABLE "thread_drafts" 
          ADD CONSTRAINT "thread_drafts_structure_id_forum_structure_id_fk" 
          FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") 
          ON DELETE set : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null ON UPDATE no action;
        END IF;
      END $$;
    `
  }
];

async function validateMigration(): Promise<boolean> {
  try {
    console.log(chalk.cyan('Validating migration...'));
    
    // Check that forum_structure table exists
    const structureTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'forum_structure'
      );
    `);
    
    if (!structureTableExists.rows[0]?.exists) {
      console.log(chalk.red('❌ forum_structure table does not exist'));
      return false;
    }
    
    // Check data was copied
    const [categoriesCount, structureCount] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM forum_categories;`),
      db.execute(sql`SELECT COUNT(*) as count FROM forum_structure;`)
    ]);
    
    const catCount = Number(categoriesCount.rows[0]?.count || 0);
    const structCount = Number(structureCount.rows[0]?.count || 0);
    
    console.log(chalk.blue(`Forum categories: ${catCount}, Forum structure: ${structCount}`));
    
    if (structCount === 0) {
      console.log(chalk.red('❌ No data was copied to forum_structure'));
      return false;
    }
    
    if (catCount > 0 && structCount < catCount) {
      console.log(chalk.yellow(`⚠️  Only ${structCount}/${catCount} records copied`));
    }
    
    // Check that new columns exist
    const newColumnsExist = await db.execute(sql`
      SELECT 
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'threads' AND column_name = 'structure_id') as threads_has_col,
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thread_prefixes' AND column_name = 'structure_id') as prefixes_has_col,
        EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thread_drafts' AND column_name = 'structure_id') as drafts_has_col;
    `);
    
    const colCheck = newColumnsExist.rows[0];
    if (!colCheck?.threads_has_col || !colCheck?.prefixes_has_col || !colCheck?.drafts_has_col) {
      console.log(chalk.red('❌ Not all structure_id columns were created'));
      return false;
    }
    
    console.log(chalk.green('✅ Migration validation passed'));
    return true;
    
  } catch (error) {
    console.error(chalk.red('Migration validation failed:'), error);
    return false;
  }
}

async function runMigration() {
  console.log(chalk.blue('🚀 Starting Forum Structure Migration (Phase 1)'));
  console.log(chalk.gray('Migrating from "forum_categories" to "forum_structure" terminology\n'));
  
  let completedSteps = 0;
  
  try {
    for (const step of migrationSteps) {
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
    
    console.log(chalk.blue('\n🔍 Validating migration...'));
    const isValid = await validateMigration();
    
    if (isValid) {
      console.log(chalk.green('\n🎉 Forum Structure Migration (Phase 1) completed successfully!'));
      console.log(chalk.gray('Next steps:'));
      console.log(chalk.gray('- Update schema files to use forum_structure'));
      console.log(chalk.gray('- Update backend services and routes'));
      console.log(chalk.gray('- Update frontend API calls'));
      console.log(chalk.gray('- Remove old forum_categories table'));
    } else {
      console.log(chalk.red('\n❌ Migration validation failed'));
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red('\n💥 Migration failed:'), error);
    console.log(chalk.yellow(`\nCompleted ${completedSteps}/${migrationSteps.length} steps`));
    console.log(chalk.gray('You may need to manually rollback changes'));
    process.exit(1);
  }
}

// Only run if called directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(console.error);
}

export { runMigration, validateMigration };