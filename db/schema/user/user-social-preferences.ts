import { pgTable, uuid, boolean, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userSocialPreferences = pgTable('user_social_preferences', {
	userId: uuid('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Mentions preferences
	allowMentions: boolean('allow_mentions').default(true).notNull(),
	mentionPermissions: varchar('mention_permissions', { length: 20 }).default('everyone').notNull(), // everyone, friends, followers, none
	mentionNotifications: boolean('mention_notifications').default(true).notNull(),
	mentionEmailNotifications: boolean('mention_email_notifications').default(false).notNull(),

	// Following preferences
	allowFollowers: boolean('allow_followers').default(true).notNull(),
	followerApprovalRequired: boolean('follower_approval_required').default(false).notNull(),
	hideFollowerCount: boolean('hide_follower_count').default(false).notNull(),
	hideFollowingCount: boolean('hide_following_count').default(false).notNull(),
	allowWhaleDesignation: boolean('allow_whale_designation').default(true).notNull(),

	// Friends preferences
	allowFriendRequests: boolean('allow_friend_requests').default(true).notNull(),
	friendRequestPermissions: varchar('friend_request_permissions', { length: 20 })
		.default('everyone')
		.notNull(), // everyone, mutuals, followers, none
	autoAcceptMutualFollows: boolean('auto_accept_mutual_follows').default(false).notNull(),
	hideOnlineStatus: boolean('hide_online_status').default(false).notNull(),
	hideFriendsList: boolean('hide_friends_list').default(false).notNull(),

	// General privacy
	showSocialActivity: boolean('show_social_activity').default(true).notNull(),
	allowDirectMessages: varchar('allow_direct_messages', { length: 20 })
		.default('friends')
		.notNull(), // friends, followers, everyone, none
	showProfileToPublic: boolean('show_profile_to_public').default(true).notNull(),
	allowSocialDiscovery: boolean('allow_social_discovery').default(true).notNull(),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});
