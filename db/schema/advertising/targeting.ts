// Insert the missing Drizzle imports at the top of the file
import {
	pgTable,
	uuid,
	varchar,
	jsonb,
	integer,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { campaigns } from './campaigns';
// Campaign rules engine for dynamic configuration
export const campaignRules = pgTable('campaign_rules', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Rule identification
	name: varchar('name', { length: 255 }).notNull(),
	description: varchar('description', { length: 500 }),
	campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }), // null = global rule
	// Rule definition
	ruleType: varchar('rule_type', { length: 50 }).notNull(), // targeting, bidding, display, frequency
	conditions: jsonb('conditions').notNull(), // Array of condition objects
	actions: jsonb('actions').notNull(), // Array of action objects
	// Rule configuration
	priority: integer('priority').notNull().default(1),
	isActive: boolean('is_active').notNull().default(true),
	validFrom: timestamp('valid_from'),
	validUntil: timestamp('valid_until'),
	// Performance tracking
	executionCount: integer('execution_count').notNull().default(0),
	lastExecutedAt: timestamp('last_executed_at'),
	// Metadata
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});
export type CampaignRule = typeof campaignRules.$inferSelect;
export type InsertCampaignRule = typeof campaignRules.$inferInsert;
