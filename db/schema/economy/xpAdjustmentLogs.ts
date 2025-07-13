import { pgTable, integer, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
export const xpAdjustmentLogs = pgTable('xp_adjustment_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	adminId: uuid('admin_id')
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
