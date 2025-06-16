import {
	pgTable,
	serial,
	uuid,
	varchar,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path

export const conversations = pgTable(
	'conversations',
	{
		id: serial('conversation_id').primaryKey(),
		uuid: uuid('uuid').notNull().defaultRandom(),
		title: varchar('title', { length: 255 }),
		isGroup: boolean('is_group').notNull().default(false),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		lastMessageAt: timestamp('last_message_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		isArchived: boolean('is_archived').notNull().default(false)
	},
	(table) => ({
		createdByIdx: index('idx_conversations_created_by').on(table.createdBy),
		updatedAtIdx: index('idx_conversations_updated_at').on(table.updatedAt)
	})
);

export type Conversation = typeof conversations.$inferSelect;
// Add InsertConversation if Zod schema is needed
// import { createInsertSchema } from "drizzle-zod";
// export const insertConversationSchema = createInsertSchema(conversations);
// export type InsertConversation = typeof conversations.$inferInsert;
