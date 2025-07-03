import {
	pgTable, serial, varchar, text, timestamp, uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const badges = pgTable('badges', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description'),
	iconUrl: varchar('icon_url', { length: 255 }).notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

import { createInsertSchema } from 'drizzle-zod';
export const insertBadgeSchema = createInsertSchema(badges);
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;
