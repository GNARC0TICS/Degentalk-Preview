import { pgTable, uuid, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../user/users';

/**
 * User Follow Preferences Table
 * 
 * Specific preferences for the follow system (subset of userSocialPreferences)
 */
export const userFollowPreferences = pgTable('user_follow_preferences', {
	userId: uuid('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	
	// Follow control settings
	allowAllFollows: boolean('allow_all_follows').default(true).notNull(),
	onlyFriendsCanFollow: boolean('only_friends_can_follow').default(false).notNull(),
	requireFollowApproval: boolean('require_follow_approval').default(false).notNull(),
	
	// Privacy settings
	hideFollowerCount: boolean('hide_follower_count').default(false).notNull(),
	hideFollowingCount: boolean('hide_following_count').default(false).notNull(),
	hideFollowersList: boolean('hide_followers_list').default(false).notNull(),
	hideFollowingList: boolean('hide_following_list').default(false).notNull(),
	
	// Notification settings
	notifyOnNewFollower: boolean('notify_on_new_follower').default(true).notNull(),
	emailOnNewFollower: boolean('email_on_new_follower').default(false).notNull(),
	
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});