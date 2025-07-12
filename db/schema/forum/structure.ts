import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	jsonb,
	real,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { roles } from '../user/roles'; // Use roles instead of deprecated userGroups
/**
 * Forum Structure Table
 *
 * This table represents the hierarchical structure of the forum system.
 * It stores both zones (top-level containers) and forums (discussion areas).
 *
 * Structure hierarchy:
 * - Zone (type: 'zone') - Top-level groupings like "The Pit", "Mission Control"
 * - Forum (type: 'forum') - Discussion areas within zones
 * - SubForum (type: 'forum' with parentId pointing to another forum)
 */
export const forumStructure = pgTable('forum_structure', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	// Hierarchy fields
	parentForumSlug: text('parent_forum_slug'), // Slug of the parent zone or forum from config
	parentId: uuid('parent_id').references((): AnyPgColumn => forumStructure.id, {
		onDelete: 'set null'
	}),
	// Type: 'zone' for top-level containers, 'forum' for discussion areas
	type: text('type').notNull().default('forum'),
	position: integer('position').notNull().default(0),
	// Access control
	isVip: boolean('is_vip').notNull().default(false),
	isLocked: boolean('is_locked').notNull().default(false),
	minXp: integer('min_xp').notNull().default(0),
	isHidden: boolean('is_hidden').notNull().default(false),
	minGroupIdRequired: integer('min_group_id_required').references(() => roles.id, {
		onDelete: 'set null'
	}),
	// Theme and appearance
	color: text('color').notNull().default('gray'),
	icon: text('icon').notNull().default('hash'),
	colorTheme: text('color_theme'),
	// Forum-specific features
	tippingEnabled: boolean('tipping_enabled').notNull().default(false),
	xpMultiplier: real('xp_multiplier').notNull().default(1.0),
	// Extensible plugin data for rules, themes, components, etc.
	pluginData: jsonb('plugin_data').default('{}'),
	// Timestamps
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});
// Type exports for better type safety
export type ForumStructureNode = typeof forumStructure.$inferSelect;
export type NewForumStructureNode = typeof forumStructure.$inferInsert;
