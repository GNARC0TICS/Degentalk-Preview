import {
	pgTable,
	serial,
	uuid,
	integer,
	text,
	varchar,
	boolean,
	timestamp,
	jsonb,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { conversations } from './conversations'; // Adjusted path

export const messages = pgTable(
	'messages',
	{
		id: serial('message_id').primaryKey(),
		uuid: uuid('uuid').notNull().defaultRandom(),
		conversationId: integer('conversation_id')
			.notNull()
			.references(() => conversations.id, { onDelete: 'cascade' }),
		senderId: integer('sender_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		content: text('content').notNull(),
		attachmentUrl: varchar('attachment_url', { length: 255 }),
		attachmentType: varchar('attachment_type', { length: 50 }),
		isEdited: boolean('is_edited').notNull().default(false),
		editedAt: timestamp('edited_at'),
		isDeleted: boolean('is_deleted').notNull().default(false),
		deletedAt: timestamp('deleted_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		systemMessageType: varchar('system_message_type', { length: 50 }),
		editorState: jsonb('editor_state')
	},
	(table) => ({
		conversationIdx: index('idx_messages_conversation_id').on(table.conversationId),
		senderIdx: index('idx_messages_sender_id').on(table.senderId),
		createdAtIdx: index('idx_messages_created_at').on(table.createdAt)
	})
);

export type Message = typeof messages.$inferSelect;
// Add InsertMessage if Zod schema is needed
