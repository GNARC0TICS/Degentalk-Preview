import {
	pgTable,
	text,
	varchar,
	doublePrecision,
	boolean,
	timestamp,
	numeric,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';
import { sql } from 'drizzle-orm';
// This table is for platform-wide treasury settings, potentially for multiple currencies (e.g., CCPayment)
export const platformTreasurySettings = pgTable('platform_treasury_settings', {
	// Renamed table
	id: uuid('id').primaryKey().defaultRandom(), // Changed back to id, as it's a new table
	currency: text('currency').notNull().unique(), // e.g., 'USDT', 'DGT' - should be unique for platform settings
	balance: numeric('balance', { precision: 18, scale: 2 }).default('0').notNull(),
	hotWalletAddress: varchar('hot_wallet_address', { length: 255 }),
	coldWalletAddress: varchar('cold_wallet_address', { length: 255 }),
	minDepositAmount: numeric('min_deposit_amount', { precision: 18, scale: 2 }).default('0'),
	maxDepositAmount: numeric('max_deposit_amount', { precision: 18, scale: 2 }),
	minWithdrawalAmount: numeric('min_withdrawal_amount', { precision: 18, scale: 2 }).default('0'),
	maxWithdrawalAmount: numeric('max_withdrawal_amount', { precision: 18, scale: 2 }),
	depositFeePercent: doublePrecision('deposit_fee_percent').default(0),
	withdrawalFeePercent: doublePrecision('withdrawal_fee_percent').default(0),
	isEnabled: boolean('is_enabled').default(true).notNull(),
	notes: text('notes'),
	lastAuditedAt: timestamp('last_audited_at', { withTimezone: true }),
	updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
export const insertPlatformTreasurySettingSchema = createInsertSchema(platformTreasurySettings);
export type PlatformTreasurySetting = typeof platformTreasurySettings.$inferSelect;
export type InsertPlatformTreasurySetting = typeof platformTreasurySettings.$inferInsert;
export const selectPlatformTreasurySettingSchema = createSelectSchema(platformTreasurySettings);
