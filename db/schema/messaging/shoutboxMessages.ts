import { pgTable, text, timestamp, boolean, index, uuid, integer, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { chatRooms } from './chatRooms'; // Adjusted path
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const shoutboxMessages = pgTable(
	'shoutbox_messages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.references(() => users.id, { onDelete: 'cascade' }),
		roomId: uuid('room_id').references(() => chatRooms.id, { onDelete: 'cascade' }), // Updated to uuid
		content: text('content').notNull(),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		editedAt: timestamp('edited_at'),
		isDeleted: boolean('is_deleted').notNull().default(false),
		isPinned: boolean('is_pinned').notNull().default(false),
		tipAmount: integer('tip_amount'), // Kept as integer
		type: text('type').notNull().default('normal'), // 'normal' | 'rain' | 'tip' | 'system'
		metadata: jsonb('metadata') // Additional data for special message types
	},
	(table) => ({
		userIdx: index('idx_shoutbox_messages_user_id').on(table.userId),
		roomIdx: index('idx_shoutbox_messages_room_id').on(table.roomId),
		createdAtIdx: index('idx_shoutbox_messages_created_at').on(table.createdAt)
	})
);
// @ts-ignore - drizzle-zod type inference issue with cross-workspace builds
export const insertShoutboxMessageSchema = createInsertSchema(shoutboxMessages, {
	content: z.string().min(2).max(250),
	roomId: z.string().uuid().optional() // Updated to uuid
}).omit({
	id: true,
	createdAt: true,
	editedAt: true,
	isDeleted: true,
	isPinned: true,
	tipAmount: true,
	type: true,
	metadata: true
});
export type ShoutboxMessage = typeof shoutboxMessages.$inferSelect;
export type InsertShoutboxMessage = z.infer<typeof insertShoutboxMessageSchema>;
