import type { AnyPgColumn, uuid } from 'drizzle-orm/pg-core';
import {
	pgTable,
	serial,
	varchar,
	integer,
	boolean,
	timestamp,
	uuid,
	bigint,
	real,
	jsonb,
	index,
	unique
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { forumStructure } from './structure'; // Updated to use forum structure
import { users } from '../user/users'; // Adjusted import path
import { threadPrefixes } from './prefixes'; // Placeholder for future import
import { contentVisibilityStatusEnum } from '../core/enums';
// import { posts } from "./posts"; // Placeholder for self-reference with posts

// Forward declare the post type for solvingPostId reference
export type PostTable = { id: AnyPgColumn }; // Corrected PgColumn to AnyPgColumn

export const threads = pgTable(
	'threads',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		uuid: uuid('uuid').notNull().defaultRandom(),
		title: varchar('title', { length: 255 }).notNull(),
		slug: varchar('slug', { length: 255 }).notNull(),
		// parentForumSlug: varchar('parent_forum_slug', { length: 128 }).notNull().default(''), // REMOVED
		structureId: integer('structure_id')
			.notNull()
			.references(() => forumStructure.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		prefixId: integer('prefix_id').references(() => threadPrefixes.id, { onDelete: 'set null' }),
		isSticky: boolean('is_sticky').notNull().default(false),
		isLocked: boolean('is_locked').notNull().default(false),
		isHidden: boolean('is_hidden').notNull().default(false),
		isFeatured: boolean('is_featured').notNull().default(false),
		featuredAt: timestamp('featured_at'),
		featuredBy: uuid('featured_by').references(() => users.id, { onDelete: 'set null' }),
		featuredExpiresAt: timestamp('featured_expires_at'),
		isDeleted: boolean('is_deleted').notNull().default(false),
		deletedAt: timestamp('deleted_at'),
		deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
		viewCount: integer('view_count').notNull().default(0),
		postCount: integer('post_count').notNull().default(0),
		firstPostLikeCount: integer('first_post_like_count').notNull().default(0),
		dgtStaked: bigint('dgt_staked', { mode: 'number' }).notNull().default(0),
		hotScore: real('hot_score').notNull().default(0),
		isBoosted: boolean('is_boosted').notNull().default(false),
		boostAmountDgt: bigint('boost_amount_dgt', { mode: 'number' }).default(0),
		boostExpiresAt: timestamp('boost_expires_at'),
		lastPostId: bigint('last_post_id', { mode: 'number' }),
		lastPostAt: timestamp('last_post_at'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		isArchived: boolean('is_archived').notNull().default(false),
		pollId: bigint('poll_id', { mode: 'number' }),
		isSolved: boolean('is_solved').notNull().default(false),
		solvingPostId: integer('solving_post_id'), // .references((): AnyPgColumn => posts.id, { onDelete: 'set null' }), // Placeholder
		pluginData: jsonb('plugin_data').default('{}'),
		visibilityStatus: contentVisibilityStatusEnum('visibility_status')
			.notNull()
			.default('published'),
		moderationReason: varchar('moderation_reason', { length: 255 }),
		xpMultiplier: real('xp_multiplier').notNull().default(1),
		rewardRules: jsonb('reward_rules').default('{}')
	},
	(table) => ({
		// parentForumSlugIdx: index('idx_threads_parent_forum_slug').on(table.parentForumSlug), // REMOVED
		structureIdx: index('idx_threads_structure_id').on(table.structureId),
		userIdx: index('idx_threads_user_id').on(table.userId),
		createdAtIdx: index('idx_threads_created_at').on(table.createdAt),
		slugUnique: unique('threads_slug_visible_unique').on(table.slug),
		hotScoreIdx: index('idx_threads_hot_score').on(table.hotScore),
		isBoostedIdx: index('idx_threads_is_boosted').on(table.isBoosted)
	})
);

// Placeholder for relations
// import { relations } from "drizzle-orm";
// export const threadsRelations = relations(threads, ({ one, many }) => ({
//   structure: one(forumStructure, { fields: [threads.structureId], references: [forumStructure.id] }),
//   user: one(users, { fields: [threads.userId], references: [users.id] }),
//   prefix: one(threadPrefixes, { fields: [threads.prefixId], references: [threadPrefixes.id] }),
//   posts: many(posts), // Assuming posts table is defined in forum/posts.ts
//   solvingPost: one(posts, {fields: [threads.solvingPostId], references: [posts.id]}),
//   // ... other relations
// }));

import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const insertThreadSchema = createInsertSchema(threads)
	.extend({
		title: z.string().min(3).max(255)
	})
	.omit({
		id: true,
		uuid: true,
		slug: true,
		isSticky: true,
		isLocked: true,
		isHidden: true,
		isFeatured: true,
		featuredAt: true,
		featuredBy: true,
		featuredExpiresAt: true,
		isDeleted: true,
		deletedAt: true,
		deletedBy: true,
		viewCount: true,
		postCount: true,
		firstPostLikeCount: true,
		dgtStaked: true,
		hotScore: true,
		isBoosted: true,
		boostAmountDgt: true,
		boostExpiresAt: true,
		lastPostId: true,
		lastPostAt: true,
		createdAt: true,
		updatedAt: true,
		isArchived: true,
		pollId: true,
		pluginData: true,
		visibilityStatus: true,
		moderationReason: true,
		xpMultiplier: true,
		rewardRules: true
	});

export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;
