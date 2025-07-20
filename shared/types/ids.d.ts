/**
 * Frontend-Safe ID Types
 *
 * String-based branded types for frontend use.
 * These provide type safety without exposing database internals.
 */
export type Id<Tag extends string> = string & {
    readonly __tag: Tag;
};
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
export type FriendId = Id<'FriendId'>;
export type FollowId = Id<'FollowId'>;
export type RequestId = Id<'RequestId'>;
export type WhaleId = Id<'WhaleId'>;
export type AdminUserId = Id<'AdminUserId'>;
export type ModeratorId = Id<'ModeratorId'>;
export type BanId = Id<'BanId'>;
export type WarningId = Id<'WarningId'>;
export type PermissionId = Id<'PermissionId'>;
export type RoleId = Id<'RoleId'>;
export type DraftId = Id<'DraftId'>;
export type EmojiPackId = Id<'EmojiPackId'>;
export type CosmeticId = Id<'CosmeticId'>;
export type PackageId = Id<'PackageId'>;
export type InventoryItemId = Id<'InventoryItemId'>;
export type TemplateId = Id<'TemplateId'>;
export type SubscriptionId = Id<'SubscriptionId'>;
export type DictionaryEntryId = Id<'DictionaryEntryId'>;
export type EntryId = Id<'EntryId'>;
export type RuleId = Id<'RuleId'>;
export type SettingId = Id<'SettingId'>;
export type ConfigId = Id<'ConfigId'>;
export type LogEntryId = Id<'LogEntryId'>;
export type AuditLogId = Id<'AuditLogId'>;
export type NotificationId = Id<'NotificationId'>;
export type StickerId = Id<'StickerId'>;
export type PackId = Id<'PackId'>;
export type CryptoWalletId = Id<'CryptoWalletId'>;
export type RainEventId = Id<'RainEventId'>;
export type WithdrawalId = Id<'WithdrawalId'>;
export type DgtPackageId = Id<'DgtPackageId'>;
export type PurchaseOrderId = Id<'PurchaseOrderId'>;
export type DgtAmount = Id<'DgtAmount'>;
export type UsdAmount = Id<'UsdAmount'>;
export type XpAmount = Id<'XpAmount'>;
export type TipAmount = Id<'TipAmount'>;
export type WithdrawalAmount = Id<'WithdrawalAmount'>;
export type TransactionType = Id<'TransactionType'>;
export type TransactionStatus = Id<'TransactionStatus'>;
export type WithdrawalStatus = Id<'WithdrawalStatus'>;
export declare const isValidUUID: (id: string) => boolean;
export { isValidId, createIdValidator, isUserId, isThreadId, isPostId, isWalletId, isTransactionId, isForumId, isItemId, isFrameId, isBadgeId, isTitleId } from '../utils/id.js';
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
/** @deprecated SECURITY: Use toId<'User'>() from @shared/utils/id instead */
export declare const asUserId: (id: string) => UserId;
/** @deprecated SECURITY: Use toId<'Thread'>() from @shared/utils/id instead */
export declare const asThreadId: (id: string) => ThreadId;
/** @deprecated SECURITY: Use toId<'Post'>() from @shared/utils/id instead */
export declare const asPostId: (id: string) => PostId;
/** @deprecated SECURITY: Use toId<'Wallet'>() from @shared/utils/id instead */
export declare const asWalletId: (id: string) => WalletId;
/** @deprecated SECURITY: Use toId<'Transaction'>() from @shared/utils/id instead */
export declare const asTransactionId: (id: string) => TransactionId;
/** @deprecated SECURITY: Use toId<'Forum'>() from @shared/utils/id instead */
export declare const asForumId: (id: string) => ForumId;
/** @deprecated SECURITY: Use toId<'Item'>() from @shared/utils/id instead */
export declare const asItemId: (id: string) => ItemId;
/** @deprecated SECURITY: Use toId<'Frame'>() from @shared/utils/id instead */
export declare const asFrameId: (id: string) => FrameId;
/** @deprecated SECURITY: Use toId<'Badge'>() from @shared/utils/id instead */
export declare const asBadgeId: (id: string) => BadgeId;
/** @deprecated SECURITY: Use toId<'Title'>() from @shared/utils/id instead */
export declare const asTitleId: (id: string) => TitleId;
/** @deprecated SECURITY: Use toId<'DictionaryEntry'>() from @shared/utils/id instead */
export declare const asDictionaryEntryId: (id: string) => DictionaryEntryId;
/** @deprecated SECURITY: Use toId<'Entry'>() from @shared/utils/id instead */
export declare const asEntryId: (id: string) => EntryId;
/** @deprecated SECURITY: Use toId<'Rule'>() from @shared/utils/id instead */
export declare const asRuleId: (id: string) => RuleId;
/** @deprecated SECURITY: Use toId<'Setting'>() from @shared/utils/id instead */
export declare const asSettingId: (id: string) => SettingId;
/** @deprecated SECURITY: Use toId<'Config'>() from @shared/utils/id instead */
export declare const asConfigId: (id: string) => ConfigId;
/** @deprecated SECURITY: Use toId<'LogEntry'>() from @shared/utils/id instead */
export declare const asLogEntryId: (id: string) => LogEntryId;
/** @deprecated SECURITY: Use toId<'AuditLog'>() from @shared/utils/id instead */
export declare const asAuditLogId: (id: string) => AuditLogId;
/** @deprecated SECURITY: Use toId<'Notification'>() from @shared/utils/id instead */
export declare const asNotificationId: (id: string) => NotificationId;
/** @deprecated SECURITY: Use toId<'Sticker'>() from @shared/utils/id instead */
export declare const asStickerId: (id: string) => StickerId;
/** @deprecated SECURITY: Use toId<'Pack'>() from @shared/utils/id instead */
export declare const asPackId: (id: string) => PackId;
/** @deprecated SECURITY: Use toId<'Friend'>() from @shared/utils/id instead */
export declare const asFriendId: (id: string) => FriendId;
/** @deprecated SECURITY: Use toId<'Follow'>() from @shared/utils/id instead */
export declare const asFollowId: (id: string) => FollowId;
/** @deprecated SECURITY: Use toId<'Request'>() from @shared/utils/id instead */
export declare const asRequestId: (id: string) => RequestId;
/** @deprecated SECURITY: Use toId<'Structure'>() from @shared/utils/id instead */
export declare const asStructureId: (id: string) => StructureId;
/** @deprecated SECURITY: Use toId<'Tag'>() from @shared/utils/id instead */
export declare const asTagId: (id: string) => TagId;
/** @deprecated SECURITY: Use toId<'Prefix'>() from @shared/utils/id instead */
export declare const asPrefixId: (id: string) => PrefixId;
/** @deprecated SECURITY: Use toId<'Category'>() from @shared/utils/id instead */
export declare const asCategoryId: (id: string) => CategoryId;
/** @deprecated SECURITY: Use toId<'Zone'>() from @shared/utils/id instead */
export declare const asZoneId: (id: string) => ZoneId;
