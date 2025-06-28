import {
	pgTable,
	timestamp,
	jsonb,
	primaryKey,
	uuid,
	integer,
	boolean,
	decimal,
	serial
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { achievements } from './achievements';

export const userAchievements = pgTable(
	'user_achievements',
	{
		id: serial('id').primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		achievementId: integer('achievement_id')
			.notNull()
			.references(() => achievements.id, { onDelete: 'cascade' }),

		// Progress tracking
		currentProgress: jsonb('current_progress').notNull().default('{}'),
		progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 })
			.notNull()
			.default('0'),
		isCompleted: boolean('is_completed').notNull().default(false),

		// Timestamps
		startedAt: timestamp('started_at')
			.notNull()
			.default(sql`now()`),
		completedAt: timestamp('completed_at'),
		notifiedAt: timestamp('notified_at'),

		// Legacy field for backward compatibility
		awardedAt: timestamp('awarded_at').default(sql`now()`),
		progress: jsonb('progress').notNull().default('{}'),

		// Completion metadata
		completionData: jsonb('completion_data').notNull().default('{}')
	},
	(table) => ({
		userAchievementUnique: primaryKey({
			name: 'user_achievement_unique',
			columns: [table.userId, table.achievementId]
		})
	})
);

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
