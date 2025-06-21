import { pgTable, serial, uuid, integer, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { cloutAchievements } from './cloutAchievements';

/**
 * Table: user_clout_log
 * -----------------------------------------
 * Records all clout earnings for a user, whether via achievements or direct grants.
 */
export const userCloutLog = pgTable(
	'user_clout_log',
	{
		id: serial('id').primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade'
			}),
		achievementId: integer('achievement_id').references(() => cloutAchievements.id, {
			onDelete: 'set null'
		}),
		cloutEarned: integer('clout_earned').notNull(),
		reason: varchar('reason', { length: 255 }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userCreatedIdx: index('idx_user_clout').on(table.userId, table.createdAt)
	})
);

export type UserCloutLog = typeof userCloutLog.$inferSelect;
export type InsertUserCloutLog = typeof userCloutLog.$inferInsert;
