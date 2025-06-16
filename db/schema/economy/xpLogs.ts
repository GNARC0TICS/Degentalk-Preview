import { pgTable, serial, /*integer,*/ date, timestamp, unique, index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const xpLogs = pgTable(
	'xp_logs',
	{
		id: serial('id').primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		date: date('date').notNull(),
		xpGained: integer('xp_gained').notNull().default(0),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => ({
		userDateUnique: unique('xp_logs_user_date_unique').on(table.userId, table.date),
		userDateIdx: index('idx_xp_logs_user_date').on(table.userId, table.date)
	})
);

// Type definitions for use in services and API responses
export type XpLog = typeof xpLogs.$inferSelect;
export type InsertXpLog = typeof xpLogs.$inferInsert;
