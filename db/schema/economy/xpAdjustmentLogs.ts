import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const xpAdjustmentLogs = pgTable('xp_adjustment_logs', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	adminId: integer('admin_id')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }), // Assuming admin is also a user
	adjustmentType: text('adjustment_type').notNull(), // 'add', 'subtract', 'set'
	amount: integer('amount').notNull(),
	reason: text('reason').notNull(),
	oldXp: integer('old_xp').notNull(),
	newXp: integer('new_xp').notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

// Add zod schema or relations as needed
// export type XpAdjustmentLog = typeof xpAdjustmentLogs.$inferSelect;
// export type InsertXpAdjustmentLog = typeof xpAdjustmentLogs.$inferInsert;
