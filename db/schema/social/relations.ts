/**
 * Social Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { friendships } from './friendships';
import { userFriendPreferences } from './userFriendPreferences';
import { friendGroups } from './friendGroups';
import { friendGroupMembers } from './friendGroupMembers';
import { mentions } from './mentions';
import { userMentionPreferences } from './userMentionPreferences';
import { userFollows } from './userFollows';
import { threads } from '../forum/threads';
import { posts } from '../forum/posts';
export const mentionsRelations = relations(mentions, ({ one, many }) => ({
	thread: one(threads, {
		fields: [mentions.threadId],
		references: [threads.id]
	}),
	post: one(posts, {
		fields: [mentions.postId],
		references: [posts.id]
	})
}));
