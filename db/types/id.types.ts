import type { Brand } from 'utility-types';

/**
 * UUID-branded primitive wrappers – ensures we never accidentally pass a plain `string` where a
 * structured ID is expected. Use these across the codebase instead of raw `string`.
 */

export type UserId = Id<'user'>;
export type ThreadId = Id<'thread'>;
export type PostId = Id<'post'>;
export type StructureId = Id<'structure'>;
export type WalletId = Id<'wallet'>;
export type TransactionId = Id<'transaction'>;
export type MissionId = Id<'mission'>;
export type AchievementId = Id<'achievement'>;
export type ProductId = Id<'product'>;
export type BadgeId = Id<'badge'>;
export type TitleId = Id<'title'>;
export type FrameId = Id<'frame'>;
export type PathId = Id<'path'>;
// Add additional IDs as needed following the same convention.

export const __ensureModule = true;

// Generic helper – use for ad-hoc IDs without cluttering this file with hundreds of aliases
export type Id<Tag extends string> = Brand<string, `${Capitalize<Tag>}Id`>;

// Commonly referenced but previously missing aliases
export type AdminId = Id<'admin'>;
export type ReporterId = Id<'reporter'>;
export type ReportId = Id<'report'>;
export type ConversationId = Id<'conversation'>;
export type RoomId = Id<'room'>;

// Core domain aliases – high-reuse entity IDs
export type AdminUserId = Id<'adminUser'>;
export type AirdropId = Id<'airdrop'>;
export type AnimationFrameId = Id<'animationFrame'>;
export type BackupId = Id<'backup'>;
export type CategoryId = Id<'category'>;
export type CoinId = Id<'coin'>;
export type AuthorId = Id<'author'>; // renamed from ContentAuthorId
export type CosmeticId = Id<'cosmetic'>;
export type EditorId = Id<'editor'>;
export type EmojiPackId = Id<'emojiPack'>;
export type EntityId = Id<'entity'>;
export type EntryId = Id<'entry'>;
export type ForumId = Id<'forum'>;
export type GroupId = Id<'group'>;
export type InventoryId = Id<'inventory'>;
export type ItemId = Id<'item'>;
export type MentionId = Id<'mention'>;
export type ModeratorId = Id<'moderator'>;
export type PackId = Id<'pack'>;
export type ParentForumId = Id<'parentForum'>;
export type ParentZoneId = Id<'parentZone'>;
export type RuleId = Id<'rule'>;
export type SettingId = Id<'setting'>;
export type StickerId = Id<'sticker'>;
export type SubscriptionId = Id<'subscription'>;
export type TagId = Id<'tag'>;
export type TemplateId = Id<'template'>;
export type TipId = Id<'tip'>;
export type UnlockTransactionId = Id<'unlockTransaction'>;
export type VaultId = Id<'vault'>;
export type VaultLockId = Id<'vaultLock'>;
export type WhaleId = Id<'whale'>;
export type ZoneId = Id<'zone'>;
export type RequestId = Id<'request'>;
export type ContentId = Id<'content'>;
export type SignatureItemId = Id<'signatureItem'>;

// Security / Auth / Admin
export type VerificationTokenId = Id<'verificationToken'>;
export type BanId = Id<'ban'>;
export type SessionId = Id<'session'>;
export type ModActionId = Id<'modAction'>;
export type IpLogId = Id<'ipLog'>;

// Thread / Post context
export type DraftId = Id<'draft'>;
export type ReplyId = Id<'reply'>;
export type QuoteId = Id<'quote'>;

// Commerce / Shop / Cosmetic
export type OrderId = Id<'order'>;
export type StoreItemId = Id<'storeItem'>;
export type UnlockId = Id<'unlock'>;

// Messaging / Social
export type NotificationId = Id<'notification'>;
export type FriendRequestId = Id<'friendRequest'>;
export type FollowRequestId = Id<'followRequest'>;
export type MessageId = Id<'message'>;

// Structural / Forum
export type PrefixId = Id<'prefix'>;

// Analytics / Logging
export type EventId = Id<'event'>;
export type AuditLogId = Id<'auditLog'>;
export type ActionId = Id<'action'>;
export type HeatEventId = Id<'heatEvent'>;

export type XpLevelId = Id<'xpLevel'>;
