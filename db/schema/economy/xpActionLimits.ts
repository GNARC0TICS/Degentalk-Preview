import { pgTable, integer, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../user/users';
import type { UserId } from '@shared/types/ids';

export const xpActionLimits = pgTable(
	'xp_action_limits',
	{
		id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
			.$type<UserId>(),
		action: text('action').notNull(),
		count: integer('count').notNull().default(1),
		lastAwarded: timestamp('last_awarded').notNull().defaultNow(),
		dayStartedAt: timestamp('day_started_at').notNull().defaultNow()
	},
	(table) => ({
		userIdIdx: index('idx_xp_action_limits_user_id').on(table.userId),
		userActionIdx: index('idx_xp_action_limits_user_action').on(table.userId, table.action),
		// Unique constraint to ensure one record per user/action combination
		userActionUnique: uniqueIndex('idx_xp_action_limits_user_action_unique').on(table.userId, table.action)
	})
);

export const xpActionLimitsRelations = relations(xpActionLimits, ({ one }) => ({
	user: one(users, {
		fields: [xpActionLimits.userId],
		references: [users.id]
	})
}));