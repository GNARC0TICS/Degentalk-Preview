/**
 * Frontend-Safe ID Types
 *
 * String-based branded types for frontend use.
 * These provide type safety without exposing database internals.
 */

export type Id<Tag extends string> = string & {
  readonly __tag: Tag;
};

// User and auth related
export type UserId = Id<'UserId'>;
export type AdminId = Id<'AdminId'>;
export type AdminUserId = Id<'AdminUserId'>;
export type ModeratorId = Id<'ModeratorId'>;

// Forum and content
export type ThreadId = Id<'ThreadId'>;
export type PostId = Id<'PostId'>;
export type ForumId = Id<'ForumId'>;
export type CategoryId = Id<'CategoryId'>;
export type StructureId = Id<'StructureId'>;
export type PrefixId = Id<'PrefixId'>;
export type TagId = Id<'TagId'>;
export type DraftId = Id<'DraftId'>;
export type ContentId = Id<'ContentId'>;

// Messaging and notifications
export type MessageId = Id<'MessageId'>;
export type ConversationId = Id<'ConversationId'>;
export type NotificationId = Id<'NotificationId'>;
export type AnnouncementId = Id<'AnnouncementId'>;
export type MentionId = Id<'MentionId'>;

// Social features
export type FriendId = Id<'FriendId'>;
export type FollowId = Id<'FollowId'>;
export type RequestId = Id<'RequestId'>;
export type WhaleId = Id<'WhaleId'>;

// Economy and wallet
export type WalletId = Id<'WalletId'>;
export type TransactionId = Id<'TransactionId'>;
export type TipId = Id<'TipId'>;
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

// Shop and inventory
export type ItemId = Id<'ItemId'>;
export type ProductId = Id<'ProductId'>;
export type OrderId = Id<'OrderId'>;
export type InventoryId = Id<'InventoryId'>;
export type InventoryItemId = Id<'InventoryItemId'>;
export type PackageId = Id<'PackageId'>;

// Achievements and progression
export type MissionId = Id<'MissionId'>;
export type AchievementId = Id<'AchievementId'>;
export type PathId = Id<'PathId'>;
export type LevelId = Id<'LevelId'>;

// Cosmetics
export type FrameId = Id<'FrameId'>;
export type BadgeId = Id<'BadgeId'>;
export type TitleId = Id<'TitleId'>;
export type EmojiId = Id<'EmojiId'>;
export type EmojiPackId = Id<'EmojiPackId'>;
export type CosmeticId = Id<'CosmeticId'>;
export type StickerId = Id<'StickerId'>;
export type PackId = Id<'PackId'>;
export type MediaId = Id<'MediaId'>;

// Moderation
export type ReportId = Id<'ReportId'>;
export type ReporterId = Id<'ReporterId'>;
export type BanId = Id<'BanId'>;
export type WarningId = Id<'WarningId'>;

// Permissions and roles
export type RoleId = Id<'RoleId'>;
export type PermissionId = Id<'PermissionId'>;

// System
export type EntityId = Id<'EntityId'>;
export type VaultId = Id<'VaultId'>;
export type ActionId = Id<'ActionId'>;
export type RoomId = Id<'RoomId'>;
export type GroupId = Id<'GroupId'>;
export type TemplateId = Id<'TemplateId'>;
export type SubscriptionId = Id<'SubscriptionId'>;
export type DictionaryEntryId = Id<'DictionaryEntryId'>;
export type EntryId = Id<'EntryId'>;
export type RuleId = Id<'RuleId'>;
export type SettingId = Id<'SettingId'>;
export type ConfigId = Id<'ConfigId'>;
export type LogEntryId = Id<'LogEntryId'>;
export type AuditLogId = Id<'AuditLogId'>;

// UUID validation
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Re-export validation functions
export { 
  isValidId, 
  createIdValidator, 
  isUserId, 
  isThreadId, 
  isPostId, 
  isWalletId, 
  isTransactionId, 
  isForumId, 
  isItemId, 
  isFrameId, 
  isBadgeId, 
  isTitleId 
} from '../utils/id.js';

/* eslint-disable degen/no-missing-branded-id-import */
/** @deprecated SECURITY: Use toId<'Category'>() from @shared/utils/id instead */
export const asCategoryId = (id: string): CategoryId => {
	console.error('SECURITY WARNING: asCategoryId() bypasses validation. Use toId() instead.');
	return id as CategoryId;
};

