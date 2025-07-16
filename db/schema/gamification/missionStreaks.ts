import { pgTable, timestamp, uuid, integer, date, pgEnum, primaryKey, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const streakTypeEnum = pgEnum('streak_type', ['daily', 'weekly']);

// Mission Streaks - tracks consecutive completion streaks
export const missionStreaks = pgTable('mission_streaks', {
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  streakType: streakTypeEnum('streak_type').notNull(),
  currentStreak: integer('current_streak').default(0).notNull(),
  bestStreak: integer('best_streak').default(0).notNull(),
  lastCompleted: date('last_completed'),
  streakBrokenAt: timestamp('streak_broken_at'),
  
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Composite primary key
  pk: primaryKey({ columns: [table.userId, table.streakType] }),
  // Index for leaderboard queries
  streakIdx: index('mission_streaks_current_streak_idx').on(table.currentStreak)
}));

export type MissionStreak = typeof missionStreaks.$inferSelect;
export type InsertMissionStreak = typeof missionStreaks.$inferInsert;