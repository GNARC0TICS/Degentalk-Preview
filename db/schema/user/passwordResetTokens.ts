import { pgTable, integer, varchar, timestamp, boolean, index, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
export const passwordResetTokens = pgTable(
	'password_reset_tokens',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		token: varchar('token', { length: 255 }).notNull().unique(),
		expiresAt: timestamp('expires_at').notNull(),
		isUsed: boolean('is_used').notNull().default(false),
		usedAt: timestamp('used_at'),
		ipRequested: varchar('ip_requested', { length: 50 }),
		ipUsed: varchar('ip_used', { length: 50 }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userIdx: index('idx_password_reset_tokens_user_id').on(table.userId),
		tokenIdx: index('idx_password_reset_tokens_token').on(table.token)
	})
);
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
