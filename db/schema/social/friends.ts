import {
	serial,
	pgTable,
	uuid,
	timestamp,
	boolean,
	text,
	pgEnum,
	varchar,
	integer
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';

// Enum for friendship status
export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted', 'blocked']);

// Friend requests and friendships table
export const friendships = pgTable('friendships', {
	id: uuid('id').primaryKey().defaultRandom(),

	// Who sent the friend request
	requesterId: uuid('requester_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Who received the friend request
	addresseeId: uuid('addressee_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Current status of the friendship
	status: friendshipStatusEnum('status').default('pending').notNull(),

	// Optional message with friend request
	requestMessage: text('request_message'),

	// Mutual permissions (what friends can do with each other)
	allowWhispers: boolean('allow_whispers').default(true).notNull(),
	allowProfileView: boolean('allow_profile_view').default(true).notNull(),
	allowActivityView: boolean('allow_activity_view').default(true).notNull(),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	respondedAt: timestamp('responded_at'),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User friendship preferences
export const userFriendPreferences = pgTable('user_friend_preferences', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Who can send friend requests
	allowAllFriendRequests: boolean('allow_all_friend_requests').default(true).notNull(),
	onlyMutualsCanRequest: boolean('only_mutuals_can_request').default(false).notNull(),
	requireMinLevel: boolean('require_min_level').default(false).notNull(),
	minLevelRequired: integer('min_level_required').default(1),

	// Auto-accept settings
	autoAcceptFromFollowers: boolean('auto_accept_from_followers').default(false).notNull(),
	autoAcceptFromWhales: boolean('auto_accept_from_whales').default(false).notNull(),

	// Privacy settings
	hideFriendsList: boolean('hide_friends_list').default(false).notNull(),
	hideFriendCount: boolean('hide_friend_count').default(false).notNull(),
	showOnlineStatus: boolean('show_online_status').default(true).notNull(),

	// Notification preferences
	notifyOnFriendRequest: boolean('notify_on_friend_request').default(true).notNull(),
	notifyOnFriendAccept: boolean('notify_on_friend_accept').default(true).notNull(),
	emailOnFriendRequest: boolean('email_on_friend_request').default(false).notNull(),

	// Default permissions for new friendships
	defaultAllowWhispers: boolean('default_allow_whispers').default(true).notNull(),
	defaultAllowProfileView: boolean('default_allow_profile_view').default(true).notNull(),
	defaultAllowActivityView: boolean('default_allow_activity_view').default(true).notNull(),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Friend groups (for organizing friends)
export const friendGroups = pgTable('friend_groups', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	name: varchar('name', { length: 50 }).notNull(),
	description: text('description'),
	color: varchar('color', { length: 7 }).default('#3b82f6'), // Hex color

	// Group settings
	isDefault: boolean('is_default').default(false).notNull(),
	sortOrder: integer('sort_order').default(0).notNull(),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Friend group memberships
export const friendGroupMembers = pgTable('friend_group_members', {
	id: uuid('id').primaryKey().defaultRandom(),
	groupId: integer('group_id')
		.notNull()
		.references(() => friendGroups.id, { onDelete: 'cascade' }),

	friendshipId: integer('friendship_id')
		.notNull()
		.references(() => friendships.id, { onDelete: 'cascade' }),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull()
});
