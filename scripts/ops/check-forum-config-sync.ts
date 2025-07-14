import type { HeatEventId } from '../shared/types/ids';
import type { ActionId } from '../shared/types/ids';
import type { AuditLogId } from '../shared/types/ids';
import type { EventId } from '../shared/types/ids';
import type { PrefixId } from '../shared/types/ids';
import type { MessageId } from '../shared/types/ids';
import type { FollowRequestId } from '../shared/types/ids';
import type { FriendRequestId } from '../shared/types/ids';
import type { NotificationId } from '../shared/types/ids';
import type { UnlockId } from '../shared/types/ids';
import type { StoreItemId } from '../shared/types/ids';
import type { OrderId } from '../shared/types/ids';
import type { QuoteId } from '../shared/types/ids';
import type { ReplyId } from '../shared/types/ids';
import type { DraftId } from '../shared/types/ids';
import type { IpLogId } from '../shared/types/ids';
import type { ModActionId } from '../shared/types/ids';
import type { SessionId } from '../shared/types/ids';
import type { BanId } from '../shared/types/ids';
import type { VerificationTokenId } from '../shared/types/ids';
import type { SignatureItemId } from '../shared/types/ids';
import type { ContentId } from '../shared/types/ids';
import type { RequestId } from '../shared/types/ids';
import type { ZoneId } from '../shared/types/ids';
import type { WhaleId } from '../shared/types/ids';
import type { VaultLockId } from '../shared/types/ids';
import type { VaultId } from '../shared/types/ids';
import type { UnlockTransactionId } from '../shared/types/ids';
import type { TipId } from '../shared/types/ids';
import type { TemplateId } from '../shared/types/ids';
import type { TagId } from '../shared/types/ids';
import type { SubscriptionId } from '../shared/types/ids';
import type { StickerId } from '../shared/types/ids';
import type { SettingId } from '../shared/types/ids';
import type { RuleId } from '../shared/types/ids';
import type { ParentZoneId } from '../shared/types/ids';
import type { ParentForumId } from '../shared/types/ids';
import type { PackId } from '../shared/types/ids';
import type { ModeratorId } from '../shared/types/ids';
import type { MentionId } from '../shared/types/ids';
import type { ItemId } from '../shared/types/ids';
import type { InventoryId } from '../shared/types/ids';
import type { GroupId } from '../shared/types/ids';
import type { ForumId } from '../shared/types/ids';
import type { EntryId } from '../shared/types/ids';
import type { EntityId } from '../shared/types/ids';
import type { EmojiPackId } from '../shared/types/ids';
import type { EditorId } from '../shared/types/ids';
import type { CosmeticId } from '../shared/types/ids';
import type { AuthorId } from '../shared/types/ids';
import type { CoinId } from '../shared/types/ids';
import type { CategoryId } from '../shared/types/ids';
import type { BackupId } from '../shared/types/ids';
import type { AnimationFrameId } from '../shared/types/ids';
import type { AirdropId } from '../shared/types/ids';
import type { AdminUserId } from '../shared/types/ids';
import type { RoomId } from '../shared/types/ids';
import type { ConversationId } from '../shared/types/ids';
import type { ReportId } from '../shared/types/ids';
import type { ReporterId } from '../shared/types/ids';
import type { AdminId } from '../shared/types/ids';
import { db } from "../../db";
import { forumStructure } from "../../db/schema/forum/structure";
import { forumMap, type Zone as ConfigZone, type Forum as ConfigForum } from "../../client/src/config/forumMap.config";
import { eq, isNull, or } from "drizzle-orm";
import chalk from "chalk";

type DbStructure = typeof forumStructure.$inferSelect;

interface Discrepancy {
  type: 'missing_in_db' | 'missing_in_config' | 'property_mismatch';
  entityType: 'zone' | 'forum';
  slug: : AdminId;
  property?: : AdminId;
  expected?: any;
  actual?: any;
  message?: : AdminId;
}

const discrepancies: Discrepancy[] = [];

// Helper to : AdminIdify for comparison, handling undefined
const stableStringify = (obj: any) => {
  if (obj === undefined) return 'undefined';
  if (obj === : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null) return ': AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null';
  // Sort object keys for consistent : AdminIdification
  if (typeof obj === 'object' && obj !== : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null) {
    const sortedObj = Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {} as any);
    return JSON.: AdminIdify(sortedObj);
  }
  return JSON.: AdminIdify(obj);
};


async function checkForumConfigSync() {
  console.log(chalk.blue("Starting forum configuration sync check..."));

  const dbStructures: DbStructure[] = await db.select().from(forumStructure);
  const dbZones = dbStructures.filter(cat => cat.type === 'zone');
  const dbForums = dbStructures.filter(cat => cat.type === 'forum');

  const configZones = forumMap.zones;
  const configForums: (ConfigForum & { parentZoneSlug: : AdminId, parentForumSlug?: : AdminId })[] = [];
  
  // Recursively flatten forums including subforums
  function flattenForums(forums: any[], parentZoneSlug: : AdminId, parentForumSlug?: : AdminId) {
    forums.forEach(forum => {
      configForums.push({ ...forum, parentZoneSlug, parentForumSlug });
      // Check for subforums
      if (forum.forums && forum.forums.length > 0) {
        flattenForums(forum.forums, parentZoneSlug, forum.slug);
      }
    });
  }
  
  configZones.forEach(zone => {
    flattenForums(zone.forums, zone.slug);
  });

  // 1. Check zones
  console.log(chalk.cyan("Checking zones..."));
  for (const cz of configZones) {
    const dz = dbZones.find(dbz => dbz.slug === cz.slug);
    if (!dz) {
      discrepancies.push({
        type: 'missing_in_db',
        entityType: 'zone',
        slug: cz.slug,
        message: `Zone '${cz.slug}' found in config but not in DB.`
      });
      continue;
    }

    // Compare properties for zones
    if (cz.name !== dz.name) {
      discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'name', expected: cz.name, actual: dz.name });
    }

    const dbPluginData = dz.pluginData as any; // Type assertion for easier access

    if (cz.description !== dbPluginData?.configDescription) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'description (from pluginData)', expected: cz.description, actual: dbPluginData?.configDescription });
    }
    if (cz.type !== dbPluginData?.configZoneType) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'config type (from pluginData)', expected: cz.type, actual: dbPluginData?.configZoneType });
    }
    if (stableStringify(cz.theme) !== stableStringify(dbPluginData?.originalTheme)) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'theme (from pluginData)', expected: cz.theme, actual: dbPluginData?.originalTheme });
    }
    // REMOVED: canonical field validation - field doesn't exist in database schema
  }

  // Check for zones in DB not in config
  for (const dz of dbZones) {
    if (!configZones.some(cz => cz.slug === dz.slug)) {
      discrepancies.push({
        type: 'missing_in_config',
        entityType: 'zone',
        slug: dz.slug,
        message: `Zone '${dz.slug}' found in DB but not in config.`
      });
    }
  }

  // 2. Check forums
  console.log(chalk.cyan("Checking forums..."));
  for (const cf of configForums) {
    const df = dbForums.find(dbf => dbf.slug === cf.slug);
    if (!df) {
      discrepancies.push({
        type: 'missing_in_db',
        entityType: 'forum',
        slug: cf.slug,
        message: `Forum '${cf.slug}' found in config but not in DB.`
      });
      continue;
    }

    // Compare properties for forums
    if (cf.name !== df.name) {
      discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'name', expected: cf.name, actual: df.name });
    }

    // Parent check - handle both direct zone children and subforums
    const expectedDbParentForumSlug = cf.parentForumSlug || cf.parentZoneSlug;
    if (expectedDbParentForumSlug !== df.parentForumSlug) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'parentForumSlug', expected: expectedDbParentForumSlug, actual: df.parentForumSlug });
    }
    
    // Check parentId linkage - could be zone or parent forum
    let expectedParentId: number | undefined;
    if (cf.parentForumSlug) {
      // This is a subforum, parent should be another forum
      const parentDbForum = dbForums.find(dbf => dbf.slug === cf.parentForumSlug);
      expectedParentId = parentDbForum?.id;
    } else {
      // This is a top-level forum, parent should be the zone
      const parentDbZone = dbZones.find(dbz => dbz.slug === cf.parentZoneSlug);
      expectedParentId = parentDbZone?.id;
    }
    
    if (expectedParentId !== df.parentId) {
        const parentType = cf.parentForumSlug ? 'forum' : 'zone';
        const parentSlug = cf.parentForumSlug || cf.parentZoneSlug;
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'parentId', expected: expectedParentId, actual: df.parentId, message: `Expected parent ${parentType} '${parentSlug}' ID.` });
    }


    // Rules and ThemeOverride from pluginData
    const dfPluginData = df.pluginData as any; // Type assertion

    if (stableStringify(cf.rules) !== stableStringify(dfPluginData?.rules)) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'rules (from pluginData)', expected: cf.rules, actual: dfPluginData?.rules });
    }
    if (stableStringify(cf.themeOverride) !== stableStringify(dfPluginData?.themeOverride)) {
        // Handle case where cf.themeOverride is undefined but dfPluginData.themeOverride is : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null (from seed script)
        if (!(cf.themeOverride === undefined && dfPluginData?.themeOverride === : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null)) {
             discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'themeOverride (from pluginData)', expected: cf.themeOverride, actual: dfPluginData?.themeOverride });
        }
    }

    // Direct rule properties
    if (cf.rules.tippingEnabled !== df.tippingEnabled) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'tippingEnabled', expected: cf.rules.tippingEnabled, actual: df.tippingEnabled });
    }
    const expectedXpMultiplier = cf.rules.xpMultiplier ?? 1.0;
    if (expectedXpMultiplier !== df.xpMultiplier) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'xpMultiplier', expected: expectedXpMultiplier, actual: df.xpMultiplier });
    }

    // Derived theme properties (color, icon) - Updated to match seeding logic
    // Handle cases where parent is a forum vs zone differently
    let parentForTheme;
    let parentThemeFromPlugin;
    
    if (cf.parentForumSlug) {
        // This is a subforum - get parent forum's theme
        const parentForum = dbForums.find(f => f.slug === cf.parentForumSlug);
        parentForTheme = parentForum;
        parentThemeFromPlugin = parentForum?.pluginData as any;
    } else {
        // This is a top-level forum - get parent zone's theme
        const parentZone = dbZones.find(z => z.id === df.parentId);
        parentForTheme = parentZone;
        parentThemeFromPlugin = parentZone?.pluginData as any;
    }

    const expectedColor = cf.themeOverride?.color || parentThemeFromPlugin?.originalTheme?.color || parentForTheme?.color || 'gray';
    if (expectedColor !== df.color) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'color (derived)', expected: expectedColor, actual: df.color });
    }

    const expectedIcon = cf.themeOverride?.icon || parentThemeFromPlugin?.originalTheme?.icon || parentForTheme?.icon || 'hash';
    if (expectedIcon !== df.icon) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'icon (derived)', expected: expectedIcon, actual: df.icon });
    }

    // REMOVED: canonical field validation for forums - field doesn't exist in database schema
  }

  // Check for forums in DB not in config
  for (const df of dbForums) {
    if (!configForums.some(cf => cf.slug === df.slug)) {
      discrepancies.push({
        type: 'missing_in_config',
        entityType: 'forum',
        slug: df.slug,
        message: `Forum '${df.slug}' found in DB but not in config.`
      });
    }
  }

  // 3. Report discrepancies
  if (discrepancies.length > 0) {
    console.log(chalk.red(`\nFound ${discrepancies.length} discrepancies:`));
    discrepancies.forEach(d => {
      console.log(chalk.yellow(`\n--- ${d.entityType.toUpperCase()} Discrepancy: ${d.slug} ---`));
      if (d.type === 'missing_in_db') {
        console.log(chalk.red(`  Missing in DB: ${d.message}`));
      } else if (d.type === 'missing_in_config') {
        console.log(chalk.red(`  Missing in Config: ${d.message}`));
      } else if (d.type === 'property_mismatch') {
        console.log(chalk.magenta(`  Property Mismatch: '${d.property}'`));
        console.log(chalk.green(`    Expected (config): ${stableStringify(d.expected)}`));
        console.log(chalk.red(`    Actual (DB):     ${stableStringify(d.actual)}`));
        if (d.message) console.log(chalk.gray(`    Note: ${d.message}`));
      }
    });
  } else {
    console.log(chalk.green("\n✅ No discrepancies found. Configuration is in sync with the database."));
  }

  console.log(chalk.blue("\nForum configuration sync check finished."));
}


async function main() {
  try {
    await checkForumConfigSync();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error during sync check:"), error);
    process.exit(1);
  }
}

main();
