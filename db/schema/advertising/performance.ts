import {
	pgTable,
	uuid,
	varchar,
	decimal,
	timestamp,
	boolean,
	jsonb,
	integer,
	bigint,
	pgEnum,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { campaigns } from './campaigns';
import { adPlacements } from './placements';
import { threads } from '../forum/threads';
// Interaction type enum
export const interactionTypeEnum = pgEnum('interaction_type', [
	'impression',
	'click',
	'conversion',
	'dgt_reward',
	'share',
	'save',
	'report'
]);
// High-volume impressions table with time-series optimization
export const adImpressions = pgTable(
	'ad_impressions',
	{
		id: bigint('id', { mode: 'bigint' }).primaryKey(),
		// Core tracking
		campaignId: uuid('campaign_id')
			.notNull()
			.references(() => campaigns.id, { onDelete: 'cascade' }),
		placementId: uuid('placement_id')
			.notNull()
			.references(() => adPlacements.id, { onDelete: 'cascade' }),
		// Privacy-preserving user tracking
		userHash: varchar('user_hash', { length: 64 }), // Anonymous identifier
		sessionId: varchar('session_id', { length: 64 }),
		// Interaction details
		interactionType: interactionTypeEnum('interaction_type').notNull(),
		timestamp: timestamp('timestamp')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		// Financial data
		bidPrice: decimal('bid_price', { precision: 8, scale: 4 }),
		paidPrice: decimal('paid_price', { precision: 8, scale: 4 }),
		revenue: decimal('revenue', { precision: 10, scale: 6 }),
		currency: varchar('currency', { length: 10 }).default('DGT'),
		// Context data
		forumSlug: varchar('forum_slug', { length: 100 }),
		threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'set null' }),
		// Technical metadata
		deviceInfo: jsonb('device_info'),
		geoData: jsonb('geo_data'), // Coarse geo only
		userAgent: varchar('user_agent', { length: 500 }),
		referrer: varchar('referrer', { length: 500 }),
		// Performance metrics
		viewDuration: integer('view_duration'), // milliseconds
		scrollDepth: decimal('scroll_depth', { precision: 3, scale: 2 }), // 0-1
		// DGT reward system integration
		dgtRewardAmount: decimal('dgt_reward_amount', { precision: 10, scale: 2 }),
		xpAwarded: integer('xp_awarded').default(0),
		// Quality scores
		fraudScore: decimal('fraud_score', { precision: 3, scale: 2 }).default('0.0'),
		qualityScore: decimal('quality_score', { precision: 3, scale: 2 }).default('1.0')
	},
	(table) => ({
		// Time-series indexes for analytics
		timestampCampaignIdx: index('idx_impressions_timestamp_campaign').on(
			table.timestamp,
			table.campaignId
		),
		campaignPlacementIdx: index('idx_impressions_campaign_placement').on(
			table.campaignId,
			table.placementId
		),
		userHashTimestampIdx: index('idx_impressions_user_timestamp').on(
			table.userHash,
			table.timestamp
		),
		// Performance indexes
		revenueTimestampIdx: index('idx_impressions_revenue_timestamp').on(
			table.revenue,
			table.timestamp
		)
	})
);
// Real-time performance aggregations
export const campaignMetrics = pgTable('campaign_metrics', {
	id: uuid('id').primaryKey().defaultRandom(),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id, { onDelete: 'cascade' }),
	// Time window
	dateHour: timestamp('date_hour').notNull(), // Hourly aggregations
	// Performance metrics
	impressions: integer('impressions').notNull().default(0),
	clicks: integer('clicks').notNull().default(0),
	conversions: integer('conversions').notNull().default(0),
	// Financial metrics
	spend: decimal('spend', { precision: 12, scale: 2 }).notNull().default('0'),
	revenue: decimal('revenue', { precision: 12, scale: 2 }).notNull().default('0'),
	dgtRewards: decimal('dgt_rewards', { precision: 12, scale: 2 }).notNull().default('0'),
	// Calculated metrics
	ctr: decimal('ctr', { precision: 5, scale: 4 }).default('0'), // Click-through rate
	cpm: decimal('cpm', { precision: 8, scale: 2 }).default('0'), // Cost per mille
	cpc: decimal('cpc', { precision: 8, scale: 4 }).default('0'), // Cost per click
	roas: decimal('roas', { precision: 5, scale: 2 }).default('0'), // Return on ad spend
	// Quality metrics
	avgQualityScore: decimal('avg_quality_score', { precision: 3, scale: 2 }).default('1.0'),
	fraudDetections: integer('fraud_detections').default(0),
	// User engagement
	uniqueUsers: integer('unique_users').default(0),
	avgViewDuration: integer('avg_view_duration').default(0),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});
export type AdImpression = typeof adImpressions.$inferSelect;
export type InsertAdImpression = typeof adImpressions.$inferInsert;
export type CampaignMetrics = typeof campaignMetrics.$inferSelect;
