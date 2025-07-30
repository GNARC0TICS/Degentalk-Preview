import {
	pgTable,
	varchar,
	text,
	integer,
	boolean,
	timestamp,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { contentEditStatusEnum } from '../core/enums';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const forumRules = pgTable(
	'forum_rules',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		title: varchar('title', { length: 255 }).notNull(),
		content: text('content').notNull(),
		contentHtml: text('content_html'),
		section: varchar('section', { length: 100 }).notNull().default('general'),
		position: integer('position').notNull().default(0),
		status: contentEditStatusEnum('status').notNull().default('published'),
		isRequired: boolean('is_required').notNull().default(false),
		lastAgreedVersionHash: varchar('last_agreed_version_hash', { length: 255 }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' })
	},
	(table) => ({
		sectionIdx: index('idx_forum_rules_section').on(table.section),
		statusIdx: index('idx_forum_rules_status').on(table.status)
	})
);
// @ts-ignore - drizzle-zod type inference issue with cross-workspace builds
export const insertForumRuleSchema = createInsertSchema(forumRules, {
	title: z.string().min(3).max(255),
	content: z.string().min(10),
	section: z.string().min(1).max(100),
	isRequired: z.boolean().default(false)
});
export type ForumRule = typeof forumRules.$inferSelect;
export type InsertForumRule = typeof forumRules.$inferInsert;
