import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	boolean,
	pgEnum,
	integer,
	index
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';
import { threads } from '../forum/threads';
import { posts } from '../forum/posts';
// Enum for mention types
export const mentionTypeEnum = pgEnum('mention_type', ['thread', 'post', 'shoutbox', 'whisper']);
// Mentions table - tracks when users are mentioned
export const mentions = pgTable('mentions', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Who was mentioned
	mentionedUserId: uuid('mentioned_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	// Who did the mentioning
	mentioningUserId: uuid('mentioning_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	// What type of content contained the mention
	type: mentionTypeEnum('type').notNull(),
	// Reference to the specific content (thread, post, etc.)
	threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }),
	postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
	// For shoutbox/whisper mentions, we'll store the message ID as text
	messageId: varchar('message_id', { length: 255 }),
	// The actual mention text (e.g., "@username")
	mentionText: varchar('mention_text', { length: 100 }).notNull(),
	// Context around the mention (snippet of the content)
	context: text('context'),
	// Notification status
	isRead: boolean('is_read').default(false).notNull(),
	isNotified: boolean('is_notified').default(false).notNull(),
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	readAt: timestamp('read_at')
});
// User mention preferences
export const userMentionPreferences = pgTable('user_mention_preferences', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	// Notification preferences
	emailNotifications: boolean('email_notifications').default(true).notNull(),
	pushNotifications: boolean('push_notifications').default(true).notNull(),
	// Which types of mentions to allow
	allowThreadMentions: boolean('allow_thread_mentions').default(true).notNull(),
	allowPostMentions: boolean('allow_post_mentions').default(true).notNull(),
	allowShoutboxMentions: boolean('allow_shoutbox_mentions').default(true).notNull(),
	allowWhisperMentions: boolean('allow_whisper_mentions').default(true).notNull(),
	// Privacy settings
	onlyFriendsMention: boolean('only_friends_mention').default(false).notNull(),
	onlyFollowersMention: boolean('only_followers_mention').default(false).notNull(),
	// Timestamps
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});
