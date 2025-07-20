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
export type WhaleId = Id<'WhaleId'>;

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


// Re-export validators from utils/id
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


/**
 * ⚠️ DEPRECATED - SECURITY VULNERABILITY ⚠️
 * 
 * These ID casting helpers bypass all validation and create security vulnerabilities.
 * They allow any string to become a branded ID without UUID validation.
 * 
 * DO NOT USE THESE FUNCTIONS
 * Use the validated conversion functions from @shared/utils/id instead:
 * - toId() for generic conversions with validation
 * - parseId() for parsing with validation
 * - isValidId() to check validity
 * 
 * For controllers, use:
 * - validateAndConvertId() from @core/helpers/validate-controller-ids
 * - SafeIdConverter from @core/helpers/safe-id-converter
 * 
 * These unsafe functions will be removed in the next major version.
 * 
 * @deprecated These functions are security vulnerabilities - use validated alternatives
 */

// ID casting helpers - DEPRECATED AND UNSAFE
/** @deprecated SECURITY: Use toId<'User'>() from @shared/utils/id instead */
export const asUserId = (id: string): UserId => {
	console.error('SECURITY WARNING: asUserId() bypasses validation. Use toId() instead.');
	return id as UserId;
};

/** @deprecated SECURITY: Use toId<'Thread'>() from @shared/utils/id instead */
export const asThreadId = (id: string): ThreadId => {
	console.error('SECURITY WARNING: asThreadId() bypasses validation. Use toId() instead.');
	return id as ThreadId;
};

/** @deprecated SECURITY: Use toId<'Post'>() from @shared/utils/id instead */
export const asPostId = (id: string): PostId => {
	console.error('SECURITY WARNING: asPostId() bypasses validation. Use toId() instead.');
	return id as PostId;
};

/** @deprecated SECURITY: Use toId<'Wallet'>() from @shared/utils/id instead */
export const asWalletId = (id: string): WalletId => {
	console.error('SECURITY WARNING: asWalletId() bypasses validation. Use toId() instead.');
	return id as WalletId;
};

/** @deprecated SECURITY: Use toId<'Transaction'>() from @shared/utils/id instead */
export const asTransactionId = (id: string): TransactionId => {
	console.error('SECURITY WARNING: asTransactionId() bypasses validation. Use toId() instead.');
	return id as TransactionId;
};

/** @deprecated SECURITY: Use toId<'Forum'>() from @shared/utils/id instead */
export const asForumId = (id: string): ForumId => {
	console.error('SECURITY WARNING: asForumId() bypasses validation. Use toId() instead.');
	return id as ForumId;
};

/** @deprecated SECURITY: Use toId<'Item'>() from @shared/utils/id instead */
export const asItemId = (id: string): ItemId => {
	console.error('SECURITY WARNING: asItemId() bypasses validation. Use toId() instead.');
	return id as ItemId;
};

/** @deprecated SECURITY: Use toId<'Frame'>() from @shared/utils/id instead */
export const asFrameId = (id: string): FrameId => {
	console.error('SECURITY WARNING: asFrameId() bypasses validation. Use toId() instead.');
	return id as FrameId;
};

/** @deprecated SECURITY: Use toId<'Badge'>() from @shared/utils/id instead */
export const asBadgeId = (id: string): BadgeId => {
	console.error('SECURITY WARNING: asBadgeId() bypasses validation. Use toId() instead.');
	return id as BadgeId;
};

/** @deprecated SECURITY: Use toId<'Title'>() from @shared/utils/id instead */
export const asTitleId = (id: string): TitleId => {
	console.error('SECURITY WARNING: asTitleId() bypasses validation. Use toId() instead.');
	return id as TitleId;
};

// Dictionary & content ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'DictionaryEntry'>() from @shared/utils/id instead */
export const asDictionaryEntryId = (id: string): DictionaryEntryId => {
	console.error('SECURITY WARNING: asDictionaryEntryId() bypasses validation. Use toId() instead.');
	return id as DictionaryEntryId;
};

/** @deprecated SECURITY: Use toId<'Entry'>() from @shared/utils/id instead */
export const asEntryId = (id: string): EntryId => {
	console.error('SECURITY WARNING: asEntryId() bypasses validation. Use toId() instead.');
	return id as EntryId;
};

/** @deprecated SECURITY: Use toId<'Rule'>() from @shared/utils/id instead */
export const asRuleId = (id: string): RuleId => {
	console.error('SECURITY WARNING: asRuleId() bypasses validation. Use toId() instead.');
	return id as RuleId;
};

// Settings & configuration ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'Setting'>() from @shared/utils/id instead */
export const asSettingId = (id: string): SettingId => {
	console.error('SECURITY WARNING: asSettingId() bypasses validation. Use toId() instead.');
	return id as SettingId;
};

/** @deprecated SECURITY: Use toId<'Config'>() from @shared/utils/id instead */
export const asConfigId = (id: string): ConfigId => {
	console.error('SECURITY WARNING: asConfigId() bypasses validation. Use toId() instead.');
	return id as ConfigId;
};

/** @deprecated SECURITY: Use toId<'LogEntry'>() from @shared/utils/id instead */
export const asLogEntryId = (id: string): LogEntryId => {
	console.error('SECURITY WARNING: asLogEntryId() bypasses validation. Use toId() instead.');
	return id as LogEntryId;
};

/** @deprecated SECURITY: Use toId<'AuditLog'>() from @shared/utils/id instead */
export const asAuditLogId = (id: string): AuditLogId => {
	console.error('SECURITY WARNING: asAuditLogId() bypasses validation. Use toId() instead.');
	return id as AuditLogId;
};

/** @deprecated SECURITY: Use toId<'Notification'>() from @shared/utils/id instead */
export const asNotificationId = (id: string): NotificationId => {
	console.error('SECURITY WARNING: asNotificationId() bypasses validation. Use toId() instead.');
	return id as NotificationId;
};

// Sticker & pack ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'Sticker'>() from @shared/utils/id instead */
export const asStickerId = (id: string): StickerId => {
	console.error('SECURITY WARNING: asStickerId() bypasses validation. Use toId() instead.');
	return id as StickerId;
};

/** @deprecated SECURITY: Use toId<'Pack'>() from @shared/utils/id instead */
export const asPackId = (id: string): PackId => {
	console.error('SECURITY WARNING: asPackId() bypasses validation. Use toId() instead.');
	return id as PackId;
};

// Social ID casting helpers - DEPRECATED
/** @deprecated SECURITY: Use toId<'Friend'>() from @shared/utils/id instead */
export const asFriendId = (id: string): FriendId => {
	console.error('SECURITY WARNING: asFriendId() bypasses validation. Use toId() instead.');
	return id as FriendId;
};

/** @deprecated SECURITY: Use toId<'Follow'>() from @shared/utils/id instead */
export const asFollowId = (id: string): FollowId => {
	console.error('SECURITY WARNING: asFollowId() bypasses validation. Use toId() instead.');
	return id as FollowId;
};

/** @deprecated SECURITY: Use toId<'Request'>() from @shared/utils/id instead */
export const asRequestId = (id: string): RequestId => {
	console.error('SECURITY WARNING: asRequestId() bypasses validation. Use toId() instead.');
	return id as RequestId;
};

// Additional casting helpers for common forum types - DEPRECATED
/** @deprecated SECURITY: Use toId<'Structure'>() from @shared/utils/id instead */
export const asStructureId = (id: string): StructureId => {
	console.error('SECURITY WARNING: asStructureId() bypasses validation. Use toId() instead.');
	return id as StructureId;
};

/** @deprecated SECURITY: Use toId<'Tag'>() from @shared/utils/id instead */
export const asTagId = (id: string): TagId => {
	console.error('SECURITY WARNING: asTagId() bypasses validation. Use toId() instead.');
	return id as TagId;
};

/** @deprecated SECURITY: Use toId<'Prefix'>() from @shared/utils/id instead */
export const asPrefixId = (id: string): PrefixId => {
	console.error('SECURITY WARNING: asPrefixId() bypasses validation. Use toId() instead.');
	return id as PrefixId;
};

/** @deprecated SECURITY: Use toId<'Category'>() from @shared/utils/id instead */
export const asCategoryId = (id: string): CategoryId => {
	console.error('SECURITY WARNING: asCategoryId() bypasses validation. Use toId() instead.');
	return id as CategoryId;
};

/** @deprecated SECURITY: Use toId<'Zone'>() from @shared/utils/id instead */
export const asZoneId = (id: string): ZoneId => {
	console.error('SECURITY WARNING: asZoneId() bypasses validation. Use toId() instead.');
	return id as ZoneId;
};
