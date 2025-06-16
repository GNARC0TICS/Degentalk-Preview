import {
	pgTable,
	serial,
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
import { userGroups } from '../user/userGroups'; // Adjusted path
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const chatRooms = pgTable(
	'chat_rooms',
	{
		id: serial('room_id').primaryKey(),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		isPrivate: boolean('is_private').notNull().default(false),
		minGroupIdRequired: integer('min_group_id_required').references(() => userGroups.id, {
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
