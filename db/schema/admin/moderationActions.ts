import { pgTable, serial, integer, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path

export const contentModerationActions = pgTable('content_moderation_actions', {
	id: serial('action_id').primaryKey(),
	moderatorId: integer('moderator_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	contentType: varchar('content_type', { length: 50 }).notNull(),
	contentId: integer('content_id').notNull(), // Similar to reportedContent, refers to content in other tables
	actionType: varchar('action_type', { length: 50 }).notNull(), // e.g., delete, hide, warn, ban_user_for_content
	reason: text('reason'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`), // Changed defaultNow() to sql`now()`
	additionalData: jsonb('additional_data').default('{}') // For storing things like duration of a temp ban, etc.
});

export type ContentModerationAction = typeof contentModerationActions.$inferSelect;
// Add InsertContentModerationAction if Zod schema is needed
