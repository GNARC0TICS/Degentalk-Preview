import { pgTable, integer, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { users } from '../user/users'; // Adjusted import
import { posts } from './posts'; // Adjusted import
import { reactionTypeEnum } from '../core/enums'; // Adjusted import
import { sql } from 'drizzle-orm';

export const postReactions = pgTable(
	'post_reactions',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		postId: integer('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		reactionType: reactionTypeEnum('reaction_type').notNull(),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`) // Changed defaultNow() to sql`now()` for consistency
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.postId, table.reactionType] }),
		postIdx: index('idx_post_reactions_post_id').on(table.postId),
		reactionTypeIdx: index('idx_post_reactions_reaction_type').on(table.reactionType)
	})
);

import { createInsertSchema } from 'drizzle-zod';
export const insertPostReactionSchema = createInsertSchema(postReactions).omit({
	createdAt: true
});
export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;
