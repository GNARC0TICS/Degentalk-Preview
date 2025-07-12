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
	pgEnum,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
// Placement position enum
export const placementPositionEnum = pgEnum('placement_position', [
	'header_banner',
	'sidebar_top',
	'sidebar_middle',
	'sidebar_bottom',
	'thread_header',
	'thread_footer',
	'between_posts',
	'forum_header',
	'zone_header',
	'mobile_banner'
]);
// Ad format enum
export const adFormatEnum = pgEnum('ad_format', [
	'banner_728x90',
	'banner_300x250',
	'banner_320x50',
	'native_card',
	'sponsored_post',
	'video_overlay',
	'popup_modal',
	'inline_text'
]);
export const adPlacements = pgTable('ad_placements', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Placement identification
	name: varchar('name', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 100 }).notNull().unique(),
	description: text('description'),
	// Location in forum
	position: placementPositionEnum('position').notNull(),
	forumZoneSlug: varchar('forum_zone_slug', { length: 100 }), // null = global
	forumSlug: varchar('forum_slug', { length: 100 }), // null = zone-wide
	// Technical specifications
	allowedFormats: jsonb('allowed_formats').notNull().default('[]'), // Array of ad_format
	dimensions: varchar('dimensions', { length: 20 }), // "728x90"
	maxFileSize: integer('max_file_size').default(2097152), // 2MB default
	// Pricing & inventory
	floorPriceCpm: decimal('floor_price_cpm', { precision: 6, scale: 2 }).notNull().default('0.50'),
	maxDailyImpressions: integer('max_daily_impressions'),
	priority: integer('priority').notNull().default(1), // Higher = more prominent
	// Configuration
	targetingConstraints: jsonb('targeting_constraints').notNull().default('{}'),
	displayRules: jsonb('display_rules').notNull().default('{}'),
	// Performance metrics
	averageCtr: decimal('average_ctr', { precision: 5, scale: 4 }).default('0.0'),
	totalImpressions: integer('total_impressions').notNull().default(0),
	totalClicks: integer('total_clicks').notNull().default(0),
	// Status
	isActive: boolean('is_active').notNull().default(true),
	requiresApproval: boolean('requires_approval').notNull().default(true),
	// Metadata
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});
export type AdPlacement = typeof adPlacements.$inferSelect;
export type InsertAdPlacement = typeof adPlacements.$inferInsert;
