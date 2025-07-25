import { pgTable, uuid, integer, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { reputationAchievements } from './reputationAchievements';
/**
 * Table: user_reputation_log
 * -----------------------------------------
 * Records all reputation earnings for a user, whether via achievements or direct grants.
 */
export const userReputationLog = pgTable(
	'user_reputation_log',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade'
			}),
		achievementId: uuid('achievement_id').references(() => reputationAchievements.id, {
			onDelete: 'set null'
		}),
		reputationEarned: integer('reputation_earned').notNull(),
		reason: varchar('reason', { length: 255 }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		userCreatedIdx: index('idx_user_reputation').on(table.userId, table.createdAt)
	})
);
export type UserReputationLog = typeof userReputationLog.$inferSelect;
export type InsertUserReputationLog = typeof userReputationLog.$inferInsert;
