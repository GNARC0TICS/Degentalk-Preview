import { pgEnum } from "drizzle-orm/pg-core";

export const shoutboxPositionEnum = pgEnum('shoutbox_position', ['sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'pending', 'resolved', 'closed', 'archived']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'info', 'system', 'private_message', 'achievement', 'transaction', 
  'post_mention', 'thread_reply', 'reaction', 'quest_complete', 'badge_awarded'
]);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'helpful']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected']);
export const vaultStatusEnum = pgEnum('vault_status', ['locked', 'unlocked', 'pending_unlock']);
export const userRoleEnum = pgEnum('user_role', ['user', 'mod', 'admin']);
