import {
	pgTable,
	uuid,
	varchar,
	text,
	decimal,
	timestamp,
	boolean,
	jsonb,
	integer,
	pgEnum
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

// Campaign status enum
export const campaignStatusEnum = pgEnum('campaign_status', [
	'draft',
	'active',
	'paused',
	'completed',
	'cancelled'
]);

// Payment method enum
export const paymentMethodEnum = pgEnum('payment_method', [
	'dgt_tokens',
	'usdt',
	'bitcoin',
	'ethereum',
	'stripe'
]);

// Campaign types enum
export const campaignTypeEnum = pgEnum('campaign_type', [
	'display_banner',
	'sponsored_thread',
	'forum_spotlight',
	'user_reward',
	'native_content'
]);

export const campaigns = pgTable('campaigns', {
	id: uuid('id').primaryKey().defaultRandom(),

	// Basic campaign info
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	advertiserUserId: uuid('advertiser_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Campaign settings
	type: campaignTypeEnum('type').notNull(),
	status: campaignStatusEnum('status').notNull().default('draft'),

	// Budget & billing
	totalBudget: decimal('total_budget', { precision: 12, scale: 2 }),
	dailyBudget: decimal('daily_budget', { precision: 10, scale: 2 }),
	spentAmount: decimal('spent_amount', { precision: 12, scale: 2 }).notNull().default('0'),
	paymentMethod: paymentMethodEnum('payment_method').notNull(),

	// Pricing model
	pricingModel: varchar('pricing_model', { length: 10 }).notNull(), // CPM, CPC, CPA, FLAT
	bidAmount: decimal('bid_amount', { precision: 8, scale: 4 }),

	// Scheduling
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),

	// Targeting & configuration
	targetingRules: jsonb('targeting_rules').notNull().default('{}'),
	placementRules: jsonb('placement_rules').notNull().default('{}'),
	frequencyCap: jsonb('frequency_cap').notNull().default('{}'),

	// Creative content
	creativeAssets: jsonb('creative_assets').notNull().default('[]'),

	// Performance settings
	optimizationGoal: varchar('optimization_goal', { length: 50 }),
	qualityScore: decimal('quality_score', { precision: 3, scale: 2 }),

	// Metadata
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
