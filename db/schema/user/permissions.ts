import {
	pgTable, serial, varchar, text, timestamp, uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const permissions = pgTable('permissions', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('perm_name', { length: 100 }).notNull().unique(),
	description: text('description'),
	category: varchar('category', { length: 50 }),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

// Add zod schema or relations as needed
// export type Permission = typeof permissions.$inferSelect;
// export type InsertPermission = typeof permissions.$inferInsert;
