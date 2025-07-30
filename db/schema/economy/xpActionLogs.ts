import { pgTable, integer, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../user/users';
import type { UserId } from '@shared/types/ids';

export const xpActionLogs = pgTable(
	'xp_action_logs',
	{
		id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
			.$type<UserId>(),
		action: text('action').notNull(),
		amount: integer('amount').notNull(),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => ({
		userIdIdx: index('idx_xp_action_logs_user_id').on(table.userId),
		actionIdx: index('idx_xp_action_logs_action').on(table.action),
		createdAtIdx: index('idx_xp_action_logs_created_at').on(table.createdAt)
	})
);

export const xpActionLogsRelations = relations(xpActionLogs, ({ one }) => ({
	user: one(users, {
		fields: [xpActionLogs.userId],
		references: [users.id]
	})
}));