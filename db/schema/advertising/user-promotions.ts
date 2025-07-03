import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	integer,
	decimal,
	boolean,
	date,
	pgEnum
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';
import { shoutboxMessages } from '../messaging/shoutboxMessages';

// Enums for user promotions
export const promotionTypeEnum = pgEnum('promotion_type', [
	'thread_boost',
	'announcement_bar',
	'pinned_shoutbox',
	'profile_spotlight',
	'achievement_highlight'
]);

export const promotionStatusEnum = pgEnum('promotion_status', [
	'pending',
	'approved',
	'active',
	'completed',
	'rejected',
	'cancelled',
	'expired'
]);

export const slotPriorityEnum = pgEnum('slot_priority', ['premium', 'standard', 'economy']);

// Main user promotions table
export const userPromotions = pgTable('user_promotions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	type: promotionTypeEnum('type').notNull(),

	// Content details
	contentId: uuid('content_id'), // @uuid-exception - polymorphic reference to thread, post, or profile
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	imageUrl: varchar('image_url', { length: 500 }),
	linkUrl: varchar('link_url', { length: 500 }),

	// Placement and timing
	targetPlacement: varchar('target_placement', { length: 100 }), // 'announcement_slot_1', 'shoutbox_pin', etc.
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	duration: integer('duration').notNull(), // Duration in hours

	// Financial details
	dgtCost: decimal('dgt_cost', { precision: 12, scale: 2 }).notNull(),
	dgtSpent: decimal('dgt_spent', { precision: 12, scale: 2 }).notNull().default('0'),

	// Status and moderation
	status: promotionStatusEnum('status').notNull().default('pending'),
	moderatorId: uuid('moderator_id').references(() => users.id),
	moderatorNotes: text('moderator_notes'),
	rejectionReason: text('rejection_reason'),

	// Performance tracking
	impressions: integer('impressions').notNull().default(0),
	clicks: integer('clicks').notNull().default(0),
	conversions: integer('conversions').notNull().default(0),

	// Advanced metrics
	uniqueViews: integer('unique_views').notNull().default(0),
	engagementRate: decimal('engagement_rate', { precision: 5, scale: 4 }).default('0'),

	// Metadata
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	approvedAt: timestamp('approved_at'),
	activatedAt: timestamp('activated_at'),
	completedAt: timestamp('completed_at'),

	// Additional configuration
	autoRenew: boolean('auto_renew').notNull().default(false),
	maxDailySpend: decimal('max_daily_spend', { precision: 10, scale: 2 }),
	targetAudience: text('target_audience') // JSON string with targeting criteria
});

// Announcement slots booking system
export const announcementSlots = pgTable('announcement_slots', {
	id: uuid('id').primaryKey().defaultRandom(),
	slotNumber: integer('slot_number').notNull(), // 1, 2, 3 for different priority levels
	priority: slotPriorityEnum('priority').notNull().default('standard'),

	// Time slot details
	date: date('date').notNull(),
	hourStart: integer('hour_start').notNull(), // Starting hour (0-23)
	hourEnd: integer('hour_end').notNull(), // Ending hour (0-23)

	// Booking information
	userPromotionId: uuid('user_promotion_id').references(() => userPromotions.id, {
		onDelete: 'set null'
	}),
	bookedByUserId: uuid('booked_by_user_id').references(() => users.id),
	isBooked: boolean('is_booked').notNull().default(false),
	bookedAt: timestamp('booked_at'),

	// Pricing details
	basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
	currentPrice: decimal('current_price', { precision: 10, scale: 2 }).notNull(),
	demandMultiplier: decimal('demand_multiplier', { precision: 3, scale: 2 })
		.notNull()
		.default('1.0'),

	// Slot configuration
	maxContentLength: integer('max_content_length').notNull().default(200),
	allowImages: boolean('allow_images').notNull().default(true),
	allowLinks: boolean('allow_links').notNull().default(true),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Shoutbox pinned messages
export const shoutboxPins = pgTable('shoutbox_pins', {
	id: uuid('id').primaryKey().defaultRandom(),
	userPromotionId: uuid('user_promotion_id')
		.notNull()
		.references(() => userPromotions.id, { onDelete: 'cascade' }),
	messageId: uuid('message_id').references(() => shoutboxMessages.id),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Message content
	content: text('content').notNull(),
	imageUrl: varchar('image_url', { length: 500 }),
	linkUrl: varchar('link_url', { length: 500 }),
	backgroundColor: varchar('background_color', { length: 20 }).default('#fbbf24'), // Default gold color
	textColor: varchar('text_color', { length: 20 }).default('#000000'),

	// Timing
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	isActive: boolean('is_active').notNull().default(true),

	// Interaction tracking
	clicks: integer('clicks').notNull().default(0),
	dismissals: integer('dismissals').notNull().default(0),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Promotion pricing configuration
export const promotionPricingConfig = pgTable('promotion_pricing_config', {
	id: uuid('id').primaryKey().defaultRandom(),
	promotionType: promotionTypeEnum('promotion_type').notNull(),
	duration: varchar('duration', { length: 50 }).notNull(), // '1h', '6h', '1d', '3d', '1w'
	basePriceDgt: decimal('base_price_dgt', { precision: 10, scale: 2 }).notNull(),

	// Dynamic pricing factors
	demandMultiplier: decimal('demand_multiplier', { precision: 3, scale: 2 })
		.notNull()
		.default('1.0'),
	timeMultiplier: decimal('time_multiplier', { precision: 3, scale: 2 }).notNull().default('1.0'),
	weekendMultiplier: decimal('weekend_multiplier', { precision: 3, scale: 2 })
		.notNull()
		.default('1.2'),

	// Peak hours configuration (JSON array of hours)
	peakHours: text('peak_hours').default('[18,19,20,21]'), // 6PM-9PM default
	peakMultiplier: decimal('peak_multiplier', { precision: 3, scale: 2 }).notNull().default('1.5'),

	// Minimum and maximum pricing
	minPrice: decimal('min_price', { precision: 10, scale: 2 }).notNull(),
	maxPrice: decimal('max_price', { precision: 10, scale: 2 }).notNull(),

	// Configuration status
	isActive: boolean('is_active').notNull().default(true),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Thread boost tracking
export const threadBoosts = pgTable('thread_boosts', {
	id: uuid('id').primaryKey().defaultRandom(),
	userPromotionId: uuid('user_promotion_id')
		.notNull()
		.references(() => userPromotions.id, { onDelete: 'cascade' }),
	threadId: uuid('thread_id').notNull(), // Reference to forum thread
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Boost configuration
	boostMultiplier: decimal('boost_multiplier', { precision: 3, scale: 2 }).notNull().default('2.0'),
	priorityLevel: integer('priority_level').notNull().default(1), // 1-5, higher = more boost

	// Timing
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	isActive: boolean('is_active').notNull().default(true),

	// Performance tracking
	extraViews: integer('extra_views').notNull().default(0),
	extraEngagement: integer('extra_engagement').notNull().default(0),
	positionImprovement: integer('position_improvement').notNull().default(0),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Profile spotlight tracking
export const profileSpotlights = pgTable('profile_spotlights', {
	id: uuid('id').primaryKey().defaultRandom(),
	userPromotionId: uuid('user_promotion_id')
		.notNull()
		.references(() => userPromotions.id, { onDelete: 'cascade' }),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Spotlight content
	spotlightMessage: text('spotlight_message').notNull(),
	highlightedAchievement: varchar('highlighted_achievement', { length: 255 }),
	customBadgeUrl: varchar('custom_badge_url', { length: 500 }),

	// Display configuration
	displayLocation: varchar('display_location', { length: 100 }).notNull().default('sidebar'), // 'sidebar', 'homepage', 'forum_header'
	displayOrder: integer('display_order').notNull().default(1),

	// Timing
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	isActive: boolean('is_active').notNull().default(true),

	// Performance tracking
	profileViews: integer('profile_views').notNull().default(0),
	followsGained: integer('follows_gained').notNull().default(0),
	interactionIncrease: decimal('interaction_increase', { precision: 5, scale: 2 }).default('0'),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// User promotion analytics aggregation table
export const userPromotionAnalytics = pgTable('user_promotion_analytics', {
	id: uuid('id').primaryKey().defaultRandom(),
	userPromotionId: uuid('user_promotion_id')
		.notNull()
		.references(() => userPromotions.id, { onDelete: 'cascade' }),

	// Time period
	date: date('date').notNull(),
	hour: integer('hour'), // For hourly analytics

	// Core metrics
	impressions: integer('impressions').notNull().default(0),
	clicks: integer('clicks').notNull().default(0),
	conversions: integer('conversions').notNull().default(0),
	uniqueViews: integer('unique_views').notNull().default(0),

	// Engagement metrics
	averageViewDuration: integer('average_view_duration').default(0), // In seconds
	bounceRate: decimal('bounce_rate', { precision: 5, scale: 4 }).default('0'),
	engagementScore: decimal('engagement_score', { precision: 5, scale: 2 }).default('0'),

	// Financial metrics
	dgtSpent: decimal('dgt_spent', { precision: 10, scale: 2 }).notNull().default('0'),
	costPerClick: decimal('cost_per_click', { precision: 10, scale: 4 }).default('0'),
	costPerConversion: decimal('cost_per_conversion', { precision: 10, scale: 4 }).default('0'),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Export types
export type UserPromotion = typeof userPromotions.$inferSelect;
export type InsertUserPromotion = typeof userPromotions.$inferInsert;

export type AnnouncementSlot = typeof announcementSlots.$inferSelect;
export type InsertAnnouncementSlot = typeof announcementSlots.$inferInsert;

export type ShoutboxPin = typeof shoutboxPins.$inferSelect;
export type InsertShoutboxPin = typeof shoutboxPins.$inferInsert;

export type PromotionPricingConfig = typeof promotionPricingConfig.$inferSelect;
export type InsertPromotionPricingConfig = typeof promotionPricingConfig.$inferInsert;

export type ThreadBoost = typeof threadBoosts.$inferSelect;
export type InsertThreadBoost = typeof threadBoosts.$inferInsert;

export type ProfileSpotlight = typeof profileSpotlights.$inferSelect;
export type InsertProfileSpotlight = typeof profileSpotlights.$inferInsert;

export type UserPromotionAnalytics = typeof userPromotionAnalytics.$inferSelect;
export type InsertUserPromotionAnalytics = typeof userPromotionAnalytics.$inferInsert;
