import { pgTable, /*integer,*/ text, timestamp, boolean, index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const directMessages = pgTable(
	'direct_messages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		senderId: uuid('sender_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		recipientId: uuid('recipient_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		content: text('content').notNull(),
		timestamp: timestamp('timestamp')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		isRead: boolean('is_read').notNull().default(false),
		isDeleted: boolean('is_deleted').notNull().default(false)
	},
	(table) => ({
		senderIdx: index('idx_direct_messages_sender_id').on(table.senderId),
		recipientIdx: index('idx_direct_messages_recipient_id').on(table.recipientId),
		timestampIdx: index('idx_direct_messages_timestamp').on(table.timestamp)
	})
);
// @ts-ignore - drizzle-zod type inference issue with cross-workspace builds
export const insertDirectMessageSchema = createInsertSchema(directMessages, {
	// id: undefined, // Auto-generated UUID primary key
	// timestamp: undefined, // defaultNow should handle this
	// isRead: undefined, // default(false) should handle this
	// isDeleted: undefined, // default(false) should handle this
	// Correcting schema to reflect that these are usually set by application logic, not direct insert
}).omit({
	id: true,
	timestamp: true,
	isRead: true,
	isDeleted: true
});
export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
