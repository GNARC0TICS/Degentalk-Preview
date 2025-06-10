import { pgEnum } from 'drizzle-orm/pg-core';

<<<<<<< HEAD
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
=======
export const shoutboxPositionEnum = pgEnum('shoutbox_position', ['sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'pending', 'resolved', 'closed', 'archived']);
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
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
	'badge_awarded'
]);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'helpful']);
<<<<<<< HEAD
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
export const userRoleEnum = pgEnum('user_role', ['user', 'mod', 'admin']);
export const contentEditStatusEnum = pgEnum('content_edit_status', [
	'draft',
	'published',
	'archived'
]);
=======
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected']);
export const vaultStatusEnum = pgEnum('vault_status', ['locked', 'unlocked', 'pending_unlock']);
export const userRoleEnum = pgEnum('user_role', ['user', 'mod', 'admin']);
>>>>>>> e9161f07a590654bde699619fdc9d26a47d0139a
