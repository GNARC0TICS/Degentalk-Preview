import {
	pgTable,
	varchar,
	text,
	boolean,
	timestamp,
	index,
	uuid,
	integer
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { roles } from '../user/roles'; // Use roles instead of deprecated userGroups
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const chatRooms = pgTable(
	'chat_rooms',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		isPrivate: boolean('is_private').notNull().default(false),
		minGroupIdRequired: integer('min_group_id_required').references(() => roles.id, {
			onDelete: 'set null'
		}),
		minXpRequired: integer('min_xp_required').default(0),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		isDeleted: boolean('is_deleted').notNull().default(false),
		order: integer('order').notNull().default(0)
	},
	(table) => ({
		nameIdx: index('idx_chat_rooms_name').on(table.name),
		privateIdx: index('idx_chat_rooms_is_private').on(table.isPrivate),
		orderIdx: index('idx_chat_rooms_order').on(table.order)
	})
);
// @ts-ignore - drizzle-zod type inference issue with cross-workspace builds
export const insertChatRoomSchema = createInsertSchema(chatRooms, {
	name: z.string().min(2).max(100),
	description: z.string().optional()
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	isDeleted: true
});
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
