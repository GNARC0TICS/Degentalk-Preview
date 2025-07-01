import type { HeatEventId } from '@db/types';
import type { ActionId } from '@db/types';
import type { AuditLogId } from '@db/types';
import type { EventId } from '@db/types';
import type { PrefixId } from '@db/types';
import type { MessageId } from '@db/types';
import type { FollowRequestId } from '@db/types';
import type { FriendRequestId } from '@db/types';
import type { NotificationId } from '@db/types';
import type { UnlockId } from '@db/types';
import type { StoreItemId } from '@db/types';
import type { OrderId } from '@db/types';
import type { QuoteId } from '@db/types';
import type { ReplyId } from '@db/types';
import type { DraftId } from '@db/types';
import type { IpLogId } from '@db/types';
import type { ModActionId } from '@db/types';
import type { SessionId } from '@db/types';
import type { BanId } from '@db/types';
import type { VerificationTokenId } from '@db/types';
import type { SignatureItemId } from '@db/types';
import type { ContentId } from '@db/types';
import type { RequestId } from '@db/types';
import type { ZoneId } from '@db/types';
import type { WhaleId } from '@db/types';
import type { VaultLockId } from '@db/types';
import type { VaultId } from '@db/types';
import type { UnlockTransactionId } from '@db/types';
import type { TipId } from '@db/types';
import type { TemplateId } from '@db/types';
import type { TagId } from '@db/types';
import type { SubscriptionId } from '@db/types';
import type { StickerId } from '@db/types';
import type { SettingId } from '@db/types';
import type { RuleId } from '@db/types';
import type { ParentZoneId } from '@db/types';
import type { ParentForumId } from '@db/types';
import type { PackId } from '@db/types';
import type { ModeratorId } from '@db/types';
import type { MentionId } from '@db/types';
import type { ItemId } from '@db/types';
import type { InventoryId } from '@db/types';
import type { GroupId } from '@db/types';
import type { ForumId } from '@db/types';
import type { EntryId } from '@db/types';
import type { EntityId } from '@db/types';
import type { EmojiPackId } from '@db/types';
import type { EditorId } from '@db/types';
import type { CosmeticId } from '@db/types';
import type { AuthorId } from '@db/types';
import type { CoinId } from '@db/types';
import type { CategoryId } from '@db/types';
import type { BackupId } from '@db/types';
import type { AnimationFrameId } from '@db/types';
import type { AirdropId } from '@db/types';
import type { AdminUserId } from '@db/types';
import type { RoomId } from '@db/types';
import type { ConversationId } from '@db/types';
import type { ReportId } from '@db/types';
import type { ReporterId } from '@db/types';
import type { AdminId } from '@db/types';
// WALLET FINALIZATION ON HOLD - Do not prioritize wallet-related features.

import { db } from '@db';
import { levels, titles, badges, economySettings } from '@schema';
import { eq } from 'drizzle-orm';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Calculate XP required for a level based on the formula: floor(500 * n ** 1.5)
 * @param level The level number
 * @returns The cumulative XP required to reach this level
 */
function calculateXpForLevel(level: number): number {
  return Math.floor(500 * Math.pow(level, 1.5));
}

/**
 * Default badge definitions for the system
 */
const DEFAULT_BADGES = [
  { id: 1, name: 'Early Adopter', description: 'Awarded for reaching level 5', iconUrl: '/images/badges/early-adopter.png' },
  { id: 2, name: 'Dedicated', description: 'Awarded for reaching level 10', iconUrl: '/images/badges/dedicated.png' },
  { id: 3, name: 'Expert', description: 'Awarded for reaching level 25', iconUrl: '/images/badges/expert.png' },
  { id: 4, name: 'Legend', description: 'Awarded for reaching level 50', iconUrl: '/images/badges/legend.png' },
  { id: 5, name: 'Mythic', description: 'Awarded for reaching level 100', iconUrl: '/images/badges/mythic.png' },
];

/**
 * Level configuration for each tier of the level system
 */
const LEVEL_CONFIG = [
  // Tier 0: Arrival (Level 0)
  { level: 0, title: 'Lurker', dgtReward: 0, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  
  // Tier 1: Early Steps (Levels 1-5)
  { level: 1, title: 'Newcomer', dgtReward: 100, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 2, title: 'Mingler', dgtReward: 150, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 3, title: 'Contributor', dgtReward: 200, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 4, title: 'Regular', dgtReward: 250, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 5, title: 'Active Member', dgtReward: 300, badgeId: 1 }, // Early Adopter badge
  
  // Tier 2: Engagement (Levels 6-15)
  { level: 6, title: 'Engaged Member', dgtReward: 350, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 7, title: 'Established Member', dgtReward: 400, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 8, title: 'Forum Friend', dgtReward: 450, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 9, title: 'Dedicated Member', dgtReward: 500, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 10, title: 'Trusted Member', dgtReward: 1000, badgeId: 2 }, // Dedicated badge
  { level: 15, title: 'Community Pillar', dgtReward: 1500, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  
  // Tier 3: Clout (Levels 16-30)
  { level: 20, title: 'Knowledge Keeper', dgtReward: 2000, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 25, title: 'Forum Sage', dgtReward: 2500, badgeId: 3 }, // Expert badge
  { level: 30, title: 'Respected Degen', dgtReward: 3000, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  
  // Tier 4: Influence (Levels 31-60)
  { level: 40, title: 'Elder Degen', dgtReward: 4000, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 50, title: 'Forum Legend', dgtReward: 5000, badgeId: 4 }, // Legend badge
  { level: 60, title: 'Wisdom Guardian', dgtReward: 6000, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  
  // Tier 5: Elite (Levels 61-99)
  { level: 75, title: 'Forum Oracle', dgtReward: 7500, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 90, title: 'Degen Icon', dgtReward: 9000, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  { level: 99, title: 'Degen Master', dgtReward: 10000, badgeId: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null },
  
  // Tier 6: Mythic (Level 100+)
  { level: 100, title: 'Degen Legend', dgtReward: 20000, badgeId: 5 }, // Mythic badge
];

/**
 * Default XP/economy settings
 */
const DEFAULT_ECONOMY_SETTINGS = [
  { key: 'POST_CREATED', value: 50 },
  { key: 'REPLY_CREATED', value: 25 },
  { key: 'HELPFUL_REACTION_RECEIVED', value: 10 },
  { key: 'LIKE_REACTION_RECEIVED', value: 5 },
  { key: 'TIP_XP_PER_UNIT', value: 1 }, // 1 XP per 10 DGT (adjust based on expected tip sizes)
  { key: 'TIP_XP_MAX_PER_EVENT', value: 100 }, // Maximum 100 XP per tip
  { key: 'DAILY_XP_CAP', value: 500 }, // Maximum 500 XP per day
];

/**
 * The main seeding function
 */
async function seedDefaultLevels() {
  console.log('🌱 [SEED-LEVELS] Seeding default levels, titles, badges, and economy settings...');
  let badgesSeeded = 0;
  let titlesSeeded = 0;
  let levelsSeeded = 0;
  let economySettingsSeeded = 0;
  let skippedBadges = 0;
  let skippedTitles = 0;
  let skippedLevels = 0;
  let skippedEconomySettings = 0;

  try {
    console.log('🛡️ [SEED-LEVELS] Seeding default badges...');
    for (const badge of DEFAULT_BADGES) {
      const existing = await db.select().from(badges).where(eq(badges.id, badge.id)).limit(1).execute();
      if (existing.length === 0) {
        await db.insert(badges)
          .values(badge)
          .execute();
        badgesSeeded++;
      } else {
        await db.update(badges)
          .set({ 
            name: badge.name,
            description: badge.description,
            iconUrl: badge.iconUrl
          })
          .where(eq(badges.id, badge.id))
          .execute();
        console.log(`🔄 [SEED-LEVELS] Updated existing badge: ${badge.name}`);
        skippedBadges++; // Counting updates as skipped for new seeding logic
      }
    }
    console.log(`✅ [SEED-LEVELS] Badges seeded: ${badgesSeeded} new, ${skippedBadges} updated/skipped.`);

    console.log('👑 [SEED-LEVELS] Seeding default titles and levels...');
    const titleIdMap = new Map<number, number>();
    
    for (const config of LEVEL_CONFIG) {
      // Check if title exists by name to avoid duplicates if script is re-run
      let titleResult = await db.select({ id: titles.id }).from(titles).where(eq(titles.name, config.title)).limit(1).execute();
      if (titleResult.length === 0) {
        [titleResult] = await db.insert(titles)
          .values({
            name: config.title,
            description: `Awarded for reaching level ${config.level}`,
            rarity: config.level >= 90 ? 'legendary' : 
                    config.level >= 60 ? 'epic' : 
                    config.level >= 30 ? 'rare' : 
                    config.level >= 10 ? 'uncommon' : 'common'
          })
          .returning({ id: titles.id });
        titlesSeeded++;
        if (titleResult && titleResult.id) titleIdMap.set(config.level, titleResult.id);
      } else {
        if (titleResult[0] && titleResult[0].id) titleIdMap.set(config.level, titleResult[0].id);
        console.log(`⏭️ [SEED-LEVELS] Skipped existing title: ${config.title}`);
        skippedTitles++;
      }
    }

    for (let level = 0; level <= 100; level++) {
      const config = LEVEL_CONFIG.find(c => c.level === level);
      const minXp = level === 0 ? 0 : calculateXpForLevel(level);
      const titleIdForLevel = titleIdMap.get(level) || : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null; // Get titleId from the map we created

      const existingLevel = await db.select().from(levels).where(eq(levels.level, level)).limit(1).execute();
      if (existingLevel.length === 0) {
        await db.insert(levels)
          .values({
            level,
            minXp,
            name: config?.title || `Level ${level}`,
            rewardDgt: config?.dgtReward || 0,
            rewardTitleId: titleIdForLevel,
            rewardBadgeId: config?.badgeId || : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null
          })
          .execute();
        levelsSeeded++;
      } else {
         await db.update(levels)
          .set({ 
            minXp,
            name: config?.title || `Level ${level}`,
            rewardDgt: config?.dgtReward || 0,
            rewardTitleId: titleIdForLevel,
            rewardBadgeId: config?.badgeId || : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null
          })
          .where(eq(levels.level, level))
          .execute();
        console.log(`🔄 [SEED-LEVELS] Updated existing level: ${level}`);
        skippedLevels++;
      }
    }
    console.log(`✅ [SEED-LEVELS] Titles & Levels seeded: ${titlesSeeded} new titles, ${skippedTitles} titles skipped/updated. ${levelsSeeded} new levels, ${skippedLevels} levels skipped/updated.`);
    
    console.log('⚙️ [SEED-LEVELS] Seeding default economy settings...');
    for (const setting of DEFAULT_ECONOMY_SETTINGS) {
      const existingSetting = await db.select().from(economySettings).where(eq(economySettings.key, setting.key)).limit(1).execute();
      if (existingSetting.length === 0) {
        await db.insert(economySettings)
          .values(setting)
          .execute();
        economySettingsSeeded++;
      } else {
        await db.update(economySettings)
          .set({ value: setting.value })
          .where(eq(economySettings.key, setting.key))
          .execute();
        console.log(`🔄 [SEED-LEVELS] Updated existing economy setting: ${setting.key}`);
        skippedEconomySettings++;
      }
    }
    console.log(`✅ [SEED-LEVELS] Economy settings seeded: ${economySettingsSeeded} new, ${skippedEconomySettings} updated/skipped.`);
    
    console.log('🎉 [SEED-LEVELS] All default level system data seeded successfully!');
    console.log(`ℹ️ [SEED-LEVELS] Summary: ${badgesSeeded} Badges, ${titlesSeeded} Titles, ${levelsSeeded} Levels, ${economySettingsSeeded} Economy Settings newly seeded.`);
    console.log(`ℹ️ [SEED-LEVELS] Skipped/Updated: ${skippedBadges} Badges, ${skippedTitles} Titles, ${skippedLevels} Levels, ${skippedEconomySettings} Economy Settings.`);

  } catch (error) {
    console.error('❌ [SEED-LEVELS] Error seeding default levels:', error);
    console.log(`ℹ️ [SEED-LEVELS] Partial Summary (before error): ${badgesSeeded} Badges, ${titlesSeeded} Titles, ${levelsSeeded} Levels, ${economySettingsSeeded} Economy Settings newly seeded.`);
    console.log(`ℹ️ [SEED-LEVELS] Skipped/Updated (before error): ${skippedBadges} Badges, ${skippedTitles} Titles, ${skippedLevels} Levels, ${skippedEconomySettings} Economy Settings.`);
    throw error;
  }
}

// Run directly from CLI if not imported (ES Module version)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  seedDefaultLevels()
    .then(() => {
      console.log('✅ [SEED-LEVELS] Seeding script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 [SEED-LEVELS] Fatal error during seeding:', error);
      process.exit(1);
    });
}

export { seedDefaultLevels, calculateXpForLevel };
