import { pgTable, timestamp, boolean, unique, index, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { conversations } from './conversations'; // Adjusted path
export const conversationParticipants = pgTable(
	'conversation_participants',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		conversationId: integer('conversation_id')
			.notNull()
			.references(() => conversations.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		joinedAt: timestamp('joined_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		lastReadAt: timestamp('last_read_at'),
		isActive: boolean('is_active').notNull().default(true),
		isMuted: boolean('is_muted').notNull().default(false),
		isAdmin: boolean('is_admin').notNull().default(false)
	},
	(table) => ({
		conversationUserUnique: unique('conversation_user_unique').on(
			table.conversationId,
			table.userId
		),
		conversationIdx: index('idx_conversation_participants_conversation_id').on(
			table.conversationId
		),
		userIdx: index('idx_conversation_participants_user_id').on(table.userId)
	})
);
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
// Add InsertConversationParticipant if Zod schema is needed
