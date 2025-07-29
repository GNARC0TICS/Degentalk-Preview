/**
 * Social Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
// import { friendships } from './friendships'; // File doesn't exist yet
// import { userFriendPreferences } from './userFriendPreferences'; // File doesn't exist yet
// import { friendGroups } from './friendGroups'; // File doesn't exist yet
// import { friendGroupMembers } from './friendGroupMembers'; // File doesn't exist yet
import { mentions } from './mentions';
// import { userMentionPreferences } from './userMentionPreferences'; // File doesn't exist yet
import { userFollows } from './user-follows'; // Fixed import path
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
