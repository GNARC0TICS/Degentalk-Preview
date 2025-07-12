import { pgTable, integer, varchar, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
export const userSettingsHistory = pgTable('user_settings_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	changedField: varchar('changed_field', { length: 100 }).notNull(),
	oldValue: text('old_value'),
	newValue: text('new_value'),
	changedAt: timestamp('changed_at')
		.notNull()
		.default(sql`now()`),
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent')
});
export type UserSettingsHistory = typeof userSettingsHistory.$inferSelect;
// export type InsertUserSettingsHistory = typeof userSettingsHistory.$inferInsert; // If needed
