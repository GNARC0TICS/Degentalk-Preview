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

// Economy-specific IDs
export type CryptoWalletId = Id<'CryptoWalletId'>;
export type RainEventId = Id<'RainEventId'>;
export type WithdrawalId = Id<'WithdrawalId'>;
export type DgtPackageId = Id<'DgtPackageId'>;
export type PurchaseOrderId = Id<'PurchaseOrderId'>;

// ID validation helpers
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const isValidId = <T extends string>(id: unknown): id is Id<T> => {
  return typeof id === 'string' && isValidUUID(id);
};

export const createIdValidator = <T extends string>(tag: T) => 
  (id: unknown): id is Id<T> => isValidId(id);

// Specific ID validators
export const isUserId = createIdValidator('UserId');
export const isThreadId = createIdValidator('ThreadId');
export const isPostId = createIdValidator('PostId');
export const isWalletId = createIdValidator('WalletId');
export const isTransactionId = createIdValidator('TransactionId');
export const isForumId = createIdValidator('ForumId');
export const isItemId = createIdValidator('ItemId');
export const isFrameId = createIdValidator('FrameId');
export const isBadgeId = createIdValidator('BadgeId');
export const isTitleId = createIdValidator('TitleId');

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