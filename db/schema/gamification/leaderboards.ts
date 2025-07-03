import {
	pgTable, serial, timestamp, varchar, jsonb, uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const leaderboardHistory = pgTable('leaderboard_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	weekStartDate: timestamp('week_start_date').notNull(),
	weekEndDate: timestamp('week_end_date').notNull(),
	leaderboardType: varchar('leaderboard_type', { length: 50 }).notNull(), // e.g., 'xp_weekly', 'clout_monthly'
	leaderboardData: jsonb('leaderboard_data').notNull().default('[]'), // Array of { userId, score, rank }
	pathType: varchar('path_type', { length: 50 }), // Optional: if leaderboard is path-specific
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`) // Changed defaultNow() to sql`now()`
});

export type LeaderboardHistoryItem = typeof leaderboardHistory.$inferSelect;
// Add InsertLeaderboardHistoryItem if Zod schema is needed
