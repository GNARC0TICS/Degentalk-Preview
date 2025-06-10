import {
	pgTable,
	serial,
	varchar,
	bigint,
	integer,
	doublePrecision,
	boolean,
	timestamp,
	text
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const dgtEconomyParameters = pgTable('dgt_economy_parameters', {
	id: serial('setting_id').primaryKey(), // Added primary key for consistency, can be a single row table if needed
	treasuryWalletAddress: varchar('treasury_wallet_address', { length: 255 }),
	dgtTreasuryBalance: bigint('dgt_treasury_balance', { mode: 'number' }).notNull().default(0),
	minWithdrawalAmount: bigint('min_withdrawal_amount', { mode: 'number' })
		.notNull()
		.default(5000000),
	withdrawalFeePercent: doublePrecision('withdrawal_fee_percent').notNull().default(0),
	rewardDistributionDelayHours: integer('reward_distribution_delay_hours').notNull().default(24),
	tipBurnPercent: integer('tip_burn_percent').notNull().default(10),
	tipRecipientPercent: integer('tip_recipient_percent').notNull().default(90),
	minTipAmount: bigint('min_tip_amount', { mode: 'number' }).notNull().default(1000000),
	maxTipAmount: bigint('max_tip_amount', { mode: 'number' }).notNull().default(1000000000),
	enableLikes: boolean('enable_likes').notNull().default(true),
	enableTips: boolean('enable_tips').notNull().default(true),
	likesGiveXp: boolean('likes_give_xp').notNull().default(true),
	tipsGiveXp: boolean('tips_give_xp').notNull().default(true),
	likeXpAmount: integer('like_xp_amount').notNull().default(5),
	tipXpMultiplier: doublePrecision('tip_xp_multiplier').notNull().default(0.1),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`),
	updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' })
});

export type DgtEconomyParameter = typeof dgtEconomyParameters.$inferSelect;
export type InsertDgtEconomyParameter = typeof dgtEconomyParameters.$inferInsert; // Assuming full insert okay for settings

export const tipSettings = pgTable('tip_settings', {
	id: serial('setting_id').primaryKey(),
	enabled: boolean('enabled').notNull().default(true),
	minAmountDGT: doublePrecision('min_amount_dgt').notNull().default(10.0),
	minAmountUSDT: doublePrecision('min_amount_usdt').notNull().default(0.1),
	maxAmountDGT: doublePrecision('max_amount_dgt').notNull().default(1000.0),
	maxAmountUSDT: doublePrecision('max_amount_usdt').notNull().default(100.0),
	burnPercentage: doublePrecision('burn_percentage').notNull().default(5.0),
	processingFeePercentage: doublePrecision('processing_fee_percentage').notNull().default(2.5),
	cooldownSeconds: integer('cooldown_seconds').notNull().default(60),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`)
});

export type TipSetting = typeof tipSettings.$inferSelect;
export type InsertTipSetting = typeof tipSettings.$inferInsert;

export const rainSettings = pgTable('rain_settings', {
	id: serial('setting_id').primaryKey(),
	enabled: boolean('enabled').notNull().default(true),
	minAmountDGT: doublePrecision('min_amount_dgt').notNull().default(10.0),
	minAmountUSDT: doublePrecision('min_amount_usdt').notNull().default(1.0),
	maxRecipients: integer('max_recipients').notNull().default(15),
	cooldownSeconds: integer('cooldown_seconds').notNull().default(60),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`)
});

// Add Zod schema if needed for rainSettings
// export type RainSetting = typeof rainSettings.$inferSelect;
// export type InsertRainSetting = typeof rainSettings.$inferInsert;

export const cooldownSettings = pgTable('cooldown_settings', {
	id: serial('id').primaryKey(), // Changed from setting_id to id for consistency with schema.ts
	tipCooldownSeconds: integer('tip_cooldown_seconds').notNull().default(10),
	rainCooldownSeconds: integer('rain_cooldown_seconds').notNull().default(60),
	moderatorBypassCooldown: boolean('moderator_bypass_cooldown').notNull().default(true),
	adminBypassCooldown: boolean('admin_bypass_cooldown').notNull().default(true),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`)
});

// Add Zod schema if needed for cooldownSettings
// export type CooldownSetting = typeof cooldownSettings.$inferSelect;
// export type InsertCooldownSetting = typeof cooldownSettings.$inferInsert;

export const xpCloutSettings = pgTable('xp_clout_settings', {
	actionKey: varchar('action_key', { length: 100 }).primaryKey(),
	xpValue: integer('xp_value').notNull().default(0),
	cloutValue: integer('clout_value').notNull().default(0),
	description: text('description')
});

// Add Zod schema if needed
// export type XpCloutSetting = typeof xpCloutSettings.$inferSelect;
// export type InsertXpCloutSetting = typeof xpCloutSettings.$inferInsert;

export const economySettings = pgTable('economy_settings', {
	key: text('key').primaryKey(),
	value: integer('value').notNull()
});

import { createInsertSchema as createInsertEconomySettingSchema } from 'drizzle-zod'; // Renamed to avoid conflict
export const insertEconomySettingSchema = createInsertEconomySettingSchema(economySettings);
export type EconomySetting = typeof economySettings.$inferSelect;
export type InsertEconomySetting = typeof economySettings.$inferInsert;
