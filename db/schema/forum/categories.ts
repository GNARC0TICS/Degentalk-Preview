import {
	pgTable,
	serial,
	text,
	integer,
	boolean,
	timestamp,
	jsonb,
	AnyPgColumn
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { userGroups } from '../user/userGroups'; // Placeholder for future import

export const forumCategories = pgTable('forum_categories', {
	id: serial('category_id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	parentId: integer('parent_id').references((): AnyPgColumn => forumCategories.id, {
		onDelete: 'set null'
	}),
	type: text('type').notNull().default('forum'), // 'zone', 'category', 'forum'
	position: integer('position').notNull().default(0),
	isVip: boolean('is_vip').notNull().default(false),
	isLocked: boolean('is_locked').notNull().default(false),
	minXp: integer('min_xp').notNull().default(0), // Renamed from minXpRequired in schema refactor plan for consistency with existing schema.ts
	color: text('color').notNull().default('gray'),
	icon: text('icon').notNull().default('hash'),
	colorTheme: text('color_theme'),
	isHidden: boolean('is_hidden').notNull().default(false),
	isZone: boolean('is_zone').default(false).notNull(),
	canonical: boolean('canonical').default(false).notNull(),
	minGroupIdRequired: integer('min_group_id_required').references(() => userGroups.id, {
		onDelete: 'set null'
	}),
	pluginData: jsonb('plugin_data').default('{}'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

// Placeholder for relations
// import { relations } from "drizzle-orm";
// import { threads } from "./threads"; // Example
// export const forumCategoriesRelations = relations(forumCategories, ({ one, many }) => ({
//   parentCategory: one(forumCategories, {
//     fields: [forumCategories.parentId],
//     references: [forumCategories.id],
//     relationName: 'parentCategory',
//   }),
//   childCategories: many(forumCategories, {
//     relationName: 'childCategories',
//   }),
//   threads: many(threads),
//   minGroup: one(userGroups, {
//      fields: [forumCategories.minGroupIdRequired],
//      references: [userGroups.id]
//   })
// }));

import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const insertForumCategorySchema = createInsertSchema(forumCategories, {
	name: z.string().min(1).max(100),
	slug: z.string().min(1).max(100),
	description: z.string().optional()
}).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	pluginData: true,
	// minGroupIdRequired: true, // Omit if it's a foreign key managed elsewhere or if not part of direct insert
	parentId: true // Usually managed via specific API or derived
});

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
