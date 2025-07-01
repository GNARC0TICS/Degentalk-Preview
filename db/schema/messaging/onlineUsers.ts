import {
	pgTable,
	serial,
	// integer, // No longer using integer for userId
	timestamp,
	varchar,
	text,
	jsonb,
	index,
	unique,
	uuid, // Added uuid
	integer // Ensured integer is imported for roomId
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { chatRooms } from './chatRooms'; // Adjusted path

export const onlineUsers = pgTable(
	'online_users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id') // Changed to uuid
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		roomId: uuid('room_id').references(() => chatRooms.id, { onDelete: 'set null' }), // Updated to uuid
		lastActive: timestamp('last_active')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		ipAddress: varchar('ip_address', { length: 45 }),
		userAgent: text('user_agent'),
		metadata: jsonb('metadata').default({}) // Default was {} in schema.ts, ensuring it's a valid JSON string for pg
	},
	(table) => ({
		userIdx: index('idx_online_users_user_id').on(table.userId),
		lastActiveIdx: index('idx_online_users_last_active').on(table.lastActive),
		uniqueUserConstraint: unique('unique_online_user').on(table.userId) // This implies one online record per user system-wide
	})
);

// Add zod schema or relations as needed
// export type OnlineUser = typeof onlineUsers.$inferSelect;
// export type InsertOnlineUser = typeof onlineUsers.$inferInsert;
