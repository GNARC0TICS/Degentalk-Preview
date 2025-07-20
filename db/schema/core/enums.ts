import { pgEnum } from 'drizzle-orm/pg-core';
export const shoutboxPositionEnum = pgEnum('shoutbox_position', [
	'sidebar-top',
	'sidebar-bottom',
	'main-top',
	'main-bottom',
	'floating'
]);
export const ticketStatusEnum = pgEnum('ticket_status', [
	'open',
	'pending',
	'resolved',
	'closed',
	'archived'
]);
export const transactionStatusEnum = pgEnum('transaction_status', [
	'pending',
	'confirmed',
	'failed',
	'reversed',
	'disputed'
]);
export const notificationTypeEnum = pgEnum('notification_type', [
	'info',
	'system',
	'private_message',
	'achievement',
	'transaction',
	'post_mention',
	'thread_reply',
	'reaction',
	'quest_complete',
	'badge_awarded',
	'rain_received',
	'level_up',
	'tip_received',
	'airdrop_received',
	'referral_complete',
	'cosmetic_unlocked',
	'mission_complete'
]);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'helpful']);
export const walletStatusEnum = pgEnum('wallet_status', ['active', 'frozen', 'suspended']);
export const transactionTypeEnum = pgEnum('transaction_type', [
	'TIP',
	'DEPOSIT',
	'WITHDRAWAL',
	'ADMIN_ADJUST',
	'RAIN',
	'AIRDROP',
	'SHOP_PURCHASE',
	'REWARD',
	'REFERRAL_BONUS',
	'FEE',
	'VAULT_LOCK',
	'VAULT_UNLOCK'
]);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', [
	'pending',
	'approved',
	'rejected'
]);
export const vaultStatusEnum = pgEnum('vault_status', ['locked', 'unlocked', 'pending_unlock']);
import { userRoleEnum } from '../../enums/user';
export { userRoleEnum };
export const contentEditStatusEnum = pgEnum('content_edit_status', [
	'draft',
	'published',
	'archived'
]);
export const contentVisibilityStatusEnum = pgEnum('content_visibility_status', [
	'draft',
	'published',
	'hidden',
	'shadowbanned',
	'archived',
	'deleted'
]);
export const mentionSourceTypeEnum = pgEnum('mention_source_type', ['post', 'thread', 'chat']);
export const subscriptionTypeEnum = pgEnum('subscription_type', ['vip_pass', 'degen_pass']);
export const subscriptionStatusEnum = pgEnum('subscription_status', [
	'active',
	'expired',
	'cancelled',
	'lifetime'
]);
export const cosmeticTypeEnum = pgEnum('cosmetic_type', [
	'avatar_frame',
	'badge',
	'title',
	'sticker',
	'emoji_pack',
	'profile_theme'
]);
// Type exports for use in application code
export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];
export type TransactionStatus = (typeof transactionStatusEnum.enumValues)[number];
export type ThreadStatus = (typeof contentVisibilityStatusEnum.enumValues)[number];
export type PostStatus = (typeof contentVisibilityStatusEnum.enumValues)[number];
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type ReactionType = (typeof reactionTypeEnum.enumValues)[number];
export type WithdrawalStatus = (typeof withdrawalStatusEnum.enumValues)[number];
export type VaultStatus = (typeof vaultStatusEnum.enumValues)[number];
export type SubscriptionType = (typeof subscriptionTypeEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
export type CosmeticType = (typeof cosmeticTypeEnum.enumValues)[number];
export type MentionSourceType = (typeof mentionSourceTypeEnum.enumValues)[number];
export type ContentEditStatus = (typeof contentEditStatusEnum.enumValues)[number];
export type ContentVisibilityStatus = (typeof contentVisibilityStatusEnum.enumValues)[number];
export type TicketStatus = (typeof ticketStatusEnum.enumValues)[number];
export type ShoutboxPosition = (typeof shoutboxPositionEnum.enumValues)[number];
