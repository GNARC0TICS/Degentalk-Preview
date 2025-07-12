import {
	integer, text, timestamp, pgEnum, pgTable, uuid,
	index
} from 'drizzle-orm/pg-core';
import { users } from '../user/users'; // Assuming users schema is in db/schema/user/users.ts
import { roles } from '../user/roles'; // Use roles instead of deprecated userGroups
export const tokenTypeEnumAirdrop = pgEnum('token_type_admin_airdrop', ['XP', 'DGT']);
export const adminManualAirdropLogs = pgTable('admin_manual_airdrop_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	adminId: uuid('admin_id')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }), // Keep record even if admin is deleted
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }), // If user is deleted, their airdrop records go
	tokenType: tokenTypeEnumAirdrop('token_type').notNull(),
	amount: integer('amount').notNull(),
	groupId: integer('group_id').references(() => roles.id, { onDelete: 'set null' }),
	note: text('note'),
	airdropBatchId: uuid('airdrop_batch_id'), // To group records from a single admin action
	createdAt: timestamp('created_at').defaultNow().notNull()
});
export type AdminManualAirdropLog = typeof adminManualAirdropLogs.$inferSelect;
export type NewAdminManualAirdropLog = typeof adminManualAirdropLogs.$inferInsert;
