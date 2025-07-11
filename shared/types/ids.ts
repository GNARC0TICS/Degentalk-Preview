import { isValidId } from '@shared/utils/id';
/* eslint-disable degen/no-missing-branded-id-import */
/**
 * Frontend-Safe ID Types
 * 
 * String-based branded types for frontend use.
 * These provide type safety without exposing database internals.
 */

// Generic ID helper
export type Id<Tag extends string> = string & { readonly __tag: Tag };

// Core entity IDs
export type UserId = Id<'UserId'>;
export type ThreadId = Id<'ThreadId'>;
export type PostId = Id<'PostId'>;
export type WalletId = Id<'WalletId'>;
export type TransactionId = Id<'TransactionId'>;
export type ForumId = Id<'ForumId'>;
export type ItemId = Id<'ItemId'>;
export type FrameId = Id<'FrameId'>;
export type BadgeId = Id<'BadgeId'>;
export type TitleId = Id<'TitleId'>;
export type PrefixId = Id<'PrefixId'>;

// Extended entity IDs
export type MissionId = Id<'MissionId'>;
export type AchievementId = Id<'AchievementId'>;
export type ProductId = Id<'ProductId'>;
export type PathId = Id<'PathId'>;
export type AdminId = Id<'AdminId'>;
export type ReportId = Id<'ReportId'>;
export type ConversationId = Id<'ConversationId'>;
export type RoomId = Id<'RoomId'>;
export type CategoryId = Id<'CategoryId'>;
export type VaultId = Id<'VaultId'>;
export type ActionId = Id<'ActionId'>;
export type TipId = Id<'TipId'>;
export type EntityId = Id<'EntityId'>;
export type EmojiId = Id<'EmojiId'>;
export type ReporterId = Id<'ReporterId'>;
export type ContentId = Id<'ContentId'>;
export type LevelId = Id<'LevelId'>;
export type TagId = Id<'TagId'>;
export type OrderId = Id<'OrderId'>;
export type GroupId = Id<'GroupId'>;
export type ParentZoneId = Id<'ParentZoneId'>;
export type ZoneId = Id<'ZoneId'>;
export type StructureId = Id<'StructureId'>;
export type InventoryId = Id<'InventoryId'>;
export type MessageId = Id<'MessageId'>;
export type AnnouncementId = Id<'AnnouncementId'>;
export type MentionId = Id<'MentionId'>;

// Social IDs
export type FriendId = Id<'FriendId'>;
export type FollowId = Id<'FollowId'>;
export type RequestId = Id<'RequestId'>;

// Admin & moderation IDs
export type AdminUserId = Id<'AdminUserId'>;
export type ModeratorId = Id<'ModeratorId'>;
export type BanId = Id<'BanId'>;
export type WarningId = Id<'WarningId'>;
export type PermissionId = Id<'PermissionId'>;
export type RoleId = Id<'RoleId'>;

// Content & cosmetics IDs
export type DraftId = Id<'DraftId'>;
export type EmojiPackId = Id<'EmojiPackId'>;
export type CosmeticId = Id<'CosmeticId'>;
export type PackageId = Id<'PackageId'>;
export type InventoryItemId = Id<'InventoryItemId'>;
export type TemplateId = Id<'TemplateId'>;
export type SubscriptionId = Id<'SubscriptionId'>;

// Dictionary & content IDs
export type DictionaryEntryId = Id<'DictionaryEntryId'>;
export type EntryId = Id<'EntryId'>;
export type RuleId = Id<'RuleId'>;

// Settings & configuration IDs
export type SettingId = Id<'SettingId'>;
export type ConfigId = Id<'ConfigId'>;
export type LogEntryId = Id<'LogEntryId'>;
export type AuditLogId = Id<'AuditLogId'>;
export type NotificationId = Id<'NotificationId'>;

// Sticker & pack IDs
export type StickerId = Id<'StickerId'>;
export type PackId = Id<'PackId'>;

// Economy-specific IDs
export type CryptoWalletId = Id<'CryptoWalletId'>;
export type RainEventId = Id<'RainEventId'>;
export type WithdrawalId = Id<'WithdrawalId'>;
export type DgtPackageId = Id<'DgtPackageId'>;
export type PurchaseOrderId = Id<'PurchaseOrderId'>;

// Amount types
export type DgtAmount = Id<'DgtAmount'>;
export type UsdAmount = Id<'UsdAmount'>;
export type XpAmount = Id<'XpAmount'>;
export type TipAmount = Id<'TipAmount'>;
export type WithdrawalAmount = Id<'WithdrawalAmount'>;

// Transaction types
export type TransactionType = Id<'TransactionType'>;
export type TransactionStatus = Id<'TransactionStatus'>;
export type WithdrawalStatus = Id<'WithdrawalStatus'>;

export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Re-export isValidId for backwards compatibility
export { isValidId };

/**
 * Generic helper to create a branded ID validator using the shared `isValidId` util.
 */
export const createIdValidator = <T extends string>() =>
  (id: unknown): id is Id<T> => isValidId(id);

// Specific ID validators
export const isUserId = createIdValidator<'UserId'>();
export const isThreadId = createIdValidator<'ThreadId'>();
export const isPostId = createIdValidator<'PostId'>();
export const isWalletId = createIdValidator<'WalletId'>();
export const isTransactionId = createIdValidator<'TransactionId'>();
export const isForumId = createIdValidator<'ForumId'>();
export const isItemId = createIdValidator<'ItemId'>();
export const isFrameId = createIdValidator<'FrameId'>();
export const isBadgeId = createIdValidator<'BadgeId'>();
export const isTitleId = createIdValidator<'TitleId'>();

// Dictionary & content ID validators
export const isDictionaryEntryId = createIdValidator<'DictionaryEntryId'>();
export const isEntryId = createIdValidator<'EntryId'>();
export const isRuleId = createIdValidator<'RuleId'>();

// Settings & configuration ID validators
export const isSettingId = createIdValidator<'SettingId'>();
export const isConfigId = createIdValidator<'ConfigId'>();
export const isLogEntryId = createIdValidator<'LogEntryId'>();
export const isAuditLogId = createIdValidator<'AuditLogId'>();
export const isNotificationId = createIdValidator<'NotificationId'>();

// Sticker & pack ID validators
export const isStickerId = createIdValidator<'StickerId'>();
export const isPackId = createIdValidator<'PackId'>();

// Social ID validators
export const isFriendId = createIdValidator<'FriendId'>();
export const isFollowId = createIdValidator<'FollowId'>();
export const isRequestId = createIdValidator<'RequestId'>();

// ID casting helpers (use with caution, prefer validation)
export const asUserId = (id: string): UserId => id as UserId;
export const asThreadId = (id: string): ThreadId => id as ThreadId;
export const asPostId = (id: string): PostId => id as PostId;
export const asWalletId = (id: string): WalletId => id as WalletId;
export const asTransactionId = (id: string): TransactionId => id as TransactionId;
export const asForumId = (id: string): ForumId => id as ForumId;
export const asItemId = (id: string): ItemId => id as ItemId;
export const asFrameId = (id: string): FrameId => id as FrameId;
export const asBadgeId = (id: string): BadgeId => id as BadgeId;
export const asTitleId = (id: string): TitleId => id as TitleId;

// Dictionary & content ID casting helpers
export const asDictionaryEntryId = (id: string): DictionaryEntryId => id as DictionaryEntryId;
export const asEntryId = (id: string): EntryId => id as EntryId;
export const asRuleId = (id: string): RuleId => id as RuleId;

// Settings & configuration ID casting helpers
export const asSettingId = (id: string): SettingId => id as SettingId;
export const asConfigId = (id: string): ConfigId => id as ConfigId;
export const asLogEntryId = (id: string): LogEntryId => id as LogEntryId;
export const asAuditLogId = (id: string): AuditLogId => id as AuditLogId;
export const asNotificationId = (id: string): NotificationId => id as NotificationId;

// Sticker & pack ID casting helpers
export const asStickerId = (id: string): StickerId => id as StickerId;
export const asPackId = (id: string): PackId => id as PackId;

// Social ID casting helpers
export const asFriendId = (id: string): FriendId => id as FriendId;
export const asFollowId = (id: string): FollowId => id as FollowId;
export const asRequestId = (id: string): RequestId => id as RequestId;