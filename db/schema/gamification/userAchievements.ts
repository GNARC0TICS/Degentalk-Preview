import { pgTable, timestamp, jsonb, primaryKey, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { achievements } from './achievements'; // Adjusted path

export const userAchievements = pgTable(
	'user_achievements',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		achievementId: integer('achievement_id')
			.notNull()
			.references(() => achievements.id, { onDelete: 'cascade' }),
		awardedAt: timestamp('awarded_at')
			.notNull()
			.default(sql`now()`), // Changed defaultNow() to sql`now()`
		progress: jsonb('progress').notNull().default('{}') // Current progress toward achievement if it's incremental
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.achievementId] })
	})
);

export type UserAchievement = typeof userAchievements.$inferSelect;
// Add InsertUserAchievement if Zod schema is needed
