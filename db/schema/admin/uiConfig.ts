import {
	pgTable, text, uuid, integer, timestamp, boolean, jsonb,
	index
} from 'drizzle-orm/pg-core';
import { users } from '../user/users'; // Added import for users table
/**
 * UI Quotes table - stores all dynamic UI text content
 * Supports hero quotes, footer quotes, toasts, loading messages, etc.
 */
export const uiQuotes = pgTable('ui_quotes', {
	id: uuid('id').defaultRandom().primaryKey(),
	// Content classification
	type: text('type').notNull(), // 'hero' | 'footer' | 'toast' | 'loading' | 'error' | 'success'
	headline: text('headline').notNull(),
	subheader: text('subheader'),
	// Categorization & targeting
	tags: text('tags').array().default([]), // ['copium', 'chaos', 'bullish', 'bearish']
	intensity: integer('intensity').default(1), // 1 (mild) to 5 (nuclear)
	theme: text('theme'), // 'default' | 'holiday' | 'bearmarket' | 'bullrun'
	targetAudience: text('target_audience'), // 'all' | 'new_users' | 'veterans' | 'vip'
	// Display & behavior
	isActive: boolean('is_active').default(true),
	displayOrder: integer('display_order').default(0), // custom sort order
	weight: integer('weight').default(1), // for weighted random selection
	// Scheduling (future feature)
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),
	// Analytics & A/B testing
	impressions: integer('impressions').default(0),
	clicks: integer('clicks').default(0),
	variant: text('variant'), // for A/B testing: 'A' | 'B' | 'control'
	// Metadata
	metadata: jsonb('metadata').default({}), // flexible data: colors, animations, etc.
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }), // admin user ID, ensured reference
	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
/**
 * UI Config Collections - groups of quotes for different contexts
 */
export const uiCollections = pgTable('ui_collections', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(), // 'Winter 2025', 'Bear Market Mood', 'Launch Week'
	description: text('description'),
	type: text('type').notNull(), // 'seasonal' | 'mood' | 'event' | 'ab_test'
	isActive: boolean('is_active').default(true),
	priority: integer('priority').default(0), // higher priority collections take precedence
	// Scheduling
	startDate: timestamp('start_date'),
	endDate: timestamp('end_date'),
	// Metadata
	config: jsonb('config').default({}), // collection-specific settings
	createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }), // ensured reference
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
/**
 * Junction table - links quotes to collections
 */
export const uiCollectionQuotes = pgTable('ui_collection_quotes', {
	id: uuid('id').defaultRandom().primaryKey(),
	collectionId: uuid('collection_id')
		.notNull()
		.references(() => uiCollections.id, { onDelete: 'cascade' }),
	quoteId: uuid('quote_id')
		.notNull()
		.references(() => uiQuotes.id, { onDelete: 'cascade' }),
	orderInCollection: integer('order_in_collection').default(0),
	weight: integer('weight').default(1), // override quote weight for this collection
	createdAt: timestamp('created_at').defaultNow()
});
/**
 * UI Analytics - track performance of quotes
 */
export const uiAnalytics = pgTable('ui_analytics', {
	id: uuid('id').defaultRandom().primaryKey(),
	quoteId: uuid('quote_id')
		.notNull()
		.references(() => uiQuotes.id, { onDelete: 'cascade' }),
	eventType: text('event_type').notNull(), // 'impression' | 'click' | 'share' | 'favorite'
	userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }), // nullable for anonymous tracking, ensured reference
	sessionId: text('session_id'),
	// Context
	page: text('page'), // where the quote was shown
	position: text('position'), // 'hero' | 'footer' | 'toast'
	userAgent: text('user_agent'),
	metadata: jsonb('metadata').default({}),
	timestamp: timestamp('timestamp').defaultNow()
});
// Export types for TypeScript
export type UiQuote = typeof uiQuotes.$inferSelect;
export type NewUiQuote = typeof uiQuotes.$inferInsert;
export type UiCollection = typeof uiCollections.$inferSelect;
export type NewUiCollection = typeof uiCollections.$inferInsert;
export type UiCollectionQuote = typeof uiCollectionQuotes.$inferSelect;
export type NewUiCollectionQuote = typeof uiCollectionQuotes.$inferInsert;
export type UiAnalytic = typeof uiAnalytics.$inferSelect;
export type NewUiAnalytic = typeof uiAnalytics.$inferInsert;
