import { pgTable, varchar, integer, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { roles } from '../user/roles'; // Use roles instead of deprecated userGroups
export const airdropSettings = pgTable('airdrop_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	tokenType: varchar('token_type', { length: 50 }).notNull(), // 'DGT' or 'XP'
	amount: integer('amount').notNull(),
	interval: varchar('interval', { length: 50 }).default('daily'), // daily, weekly, one-time
	targetGroupId: integer('target_group_id').references(() => roles.id), // References roles table (was userGroups)
	enabled: boolean('enabled').default(true),
	createdAt: timestamp('created_at').defaultNow()
});
export type AirdropSetting = typeof airdropSettings.$inferSelect;
export type InsertAirdropSetting = typeof airdropSettings.$inferInsert;
