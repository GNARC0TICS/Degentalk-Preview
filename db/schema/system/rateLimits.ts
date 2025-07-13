import { pgTable, text, integer, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm'; // Assuming sql is needed for default timestamps
export const rateLimits = pgTable(
	'rate_limits',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		key: text('key').notNull(), // Can be User ID, IP address, or a combination
		endpoint: text('endpoint').notNull(), // API endpoint or action being rate-limited
		count: integer('count').notNull().default(0),
		resetAt: timestamp('reset_at').notNull(), // Timestamp when the count resets
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`), // Changed from .notNull() to .default(sql`now()`) for auto-population
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`) // Changed from .notNull() to .default(sql`now()`) for auto-population
	},
	(table) => ({
		idx_rateLimits_createdAt: index('idx_rateLimits_createdAt').on(table.createdAt),
		idx_rateLimits_updatedAt: index('idx_rateLimits_updatedAt').on(table.updatedAt)
	})
);
export type RateLimit = typeof rateLimits.$inferSelect;
// Add InsertRateLimit if Zod schema is needed
