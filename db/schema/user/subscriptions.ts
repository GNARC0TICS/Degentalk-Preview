import {
	pgTable,
	uuid,
	varchar,
	integer,
	boolean,
	timestamp,
	text,
	jsonb,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { subscriptionTypeEnum, subscriptionStatusEnum, cosmeticTypeEnum } from '../core/enums';
/**
 * Subscription Types and Status are defined in core/enums.ts
 * - vip_pass: One-time lifetime unlock (500 DGT)
 * - degen_pass: Monthly subscription (100 DGT/month) with 120 DGT cosmetic value
 */
/**
 * User Subscriptions Table
 * Tracks both VIP Pass (lifetime) and Degen Pass (monthly) subscriptions
 */
export const subscriptions = pgTable('subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	// Subscription details
	type: subscriptionTypeEnum('type').notNull(), // 'vip_pass' or 'degen_pass'
	status: subscriptionStatusEnum('status').notNull().default('active'), // 'active', 'expired', 'cancelled', 'lifetime'
	// Pricing and billing
	pricePaid: integer('price_paid').notNull(), // DGT amount paid (500 for VIP, 100 for Degen)
	currency: varchar('currency', { length: 10 }).notNull().default('DGT'),
	// Timing
	startDate: timestamp('start_date').notNull().defaultNow(),
	endDate: timestamp('end_date'), // null for lifetime VIP Pass
	nextBillingDate: timestamp('next_billing_date'), // for monthly Degen Pass
	lastPaymentDate: timestamp('last_payment_date').notNull().defaultNow(),
	// Auto-renewal for monthly subscriptions
	autoRenew: boolean('auto_renew').notNull().default(true),
	// Cosmetic drops for Degen Pass
	lastCosmeticDrop: timestamp('last_cosmetic_drop'), // Track when last cosmetic was dropped
	totalCosmeticValue: integer('total_cosmetic_value').notNull().default(0), // Total value of cosmetics received
	// Transaction tracking
	purchaseTransactionId: integer('purchase_transaction_id'), // Reference to DGT transaction
	// Benefits tracking
	benefits: jsonb('benefits').default('{}'), // Store subscription benefits and usage
	// Metadata
	metadata: jsonb('metadata').default('{}'), // Additional data like purchase source, etc.
	notes: text('notes'), // Admin notes
	// Timestamps
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	// Soft delete
	isDeleted: boolean('is_deleted').notNull().default(false)
});
/**
 * Subscription Benefits Table
 * Defines what each subscription type provides
 */
export const subscriptionBenefits = pgTable('subscription_benefits', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Subscription type this benefit applies to
	subscriptionType: subscriptionTypeEnum('subscription_type').notNull(),
	// Benefit details
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description'),
	benefitKey: varchar('benefit_key', { length: 50 }).notNull(), // programmatic key for checking
	// Benefit configuration
	value: integer('value'), // numeric value if applicable
	config: jsonb('config').default('{}'), // additional configuration
	// Status and ordering
	isActive: boolean('is_active').notNull().default(true),
	sortOrder: integer('sort_order').notNull().default(0),
	// Timestamps
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});
/**
 * Cosmetic Drop Records
 * Tracks monthly cosmetic drops for Degen Pass subscribers
 */
export const cosmeticDrops = pgTable('cosmetic_drops', {
	id: uuid('id').primaryKey().defaultRandom(),
	// User and subscription
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	subscriptionId: integer('subscription_id')
		.notNull()
		.references(() => subscriptions.id, { onDelete: 'cascade' }),
	// Drop details
	dropMonth: integer('drop_month').notNull(), // 1-12
	dropYear: integer('drop_year').notNull(),
	// Cosmetic items dropped
	cosmeticType: cosmeticTypeEnum('cosmetic_type').notNull(), // 'avatar_frame', 'badge', 'title', etc.
	cosmeticId: integer('cosmetic_id').notNull(), // ID of the cosmetic item
	cosmeticName: varchar('cosmetic_name', { length: 100 }).notNull(),
	cosmeticValue: integer('cosmetic_value').notNull().default(120), // DGT value (120 for Degen Pass)
	// Status
	claimed: boolean('claimed').notNull().default(false),
	claimedAt: timestamp('claimed_at'),
	// Metadata
	metadata: jsonb('metadata').default('{}'),
	notes: text('notes'),
	// Timestamps
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});
// Types for TypeScript
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionBenefit = typeof subscriptionBenefits.$inferSelect;
export type InsertSubscriptionBenefit = typeof subscriptionBenefits.$inferInsert;
export type CosmeticDrop = typeof cosmeticDrops.$inferSelect;
export type InsertCosmeticDrop = typeof cosmeticDrops.$inferInsert;
/**
 * Default Subscription Benefits Configuration
 */
export const DEFAULT_SUBSCRIPTION_BENEFITS = {
	vip_pass: [
		{
			name: 'Lifetime VIP Status',
			description: 'Permanent VIP status with all current and future VIP benefits',
			benefitKey: 'lifetime_vip',
			value: 1
		},
		{
			name: 'VIP Badge',
			description: 'Exclusive VIP badge displayed on profile and posts',
			benefitKey: 'vip_badge',
			value: 1
		},
		{
			name: 'Priority Support',
			description: 'Faster response times for support tickets',
			benefitKey: 'priority_support',
			value: 1
		},
		{
			name: 'Advanced Forum Features',
			description: 'Access to VIP-only forums and advanced posting features',
			benefitKey: 'advanced_forum_features',
			value: 1
		}
	],
	degen_pass: [
		{
			name: 'Monthly Cosmetic Drop',
			description: 'Receive 120 DGT worth of cosmetic items every month',
			benefitKey: 'monthly_cosmetic_drop',
			value: 120
		},
		{
			name: 'Degen Badge',
			description: 'Monthly subscriber badge displayed on profile and posts',
			benefitKey: 'degen_badge',
			value: 1
		},
		{
			name: 'Exclusive Content Access',
			description: 'Access to subscriber-only content and discussions',
			benefitKey: 'exclusive_content',
			value: 1
		},
		{
			name: 'Enhanced Profile Features',
			description: 'Additional profile customization options',
			benefitKey: 'enhanced_profile',
			value: 1
		}
	]
} as const;
