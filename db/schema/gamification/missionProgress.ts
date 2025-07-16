import { pgTable, timestamp, uuid, integer, varchar, unique, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { activeMissions } from './activeMissions';

// Mission Progress - tracks detailed progress for each requirement
export const missionProgress = pgTable('mission_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  missionId: uuid('mission_id')
    .notNull()
    .references(() => activeMissions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  requirementKey: varchar('requirement_key', { length: 100 }).notNull(), // e.g., 'posts_created', 'tips_sent'
  currentValue: integer('current_value').default(0).notNull(),
  targetValue: integer('target_value').notNull(),
  
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Ensure unique progress tracking per requirement
  uniqueProgress: unique('unique_mission_progress').on(table.missionId, table.requirementKey),
  // Indexes for efficient queries
  missionIdIdx: index('mission_progress_mission_id_idx').on(table.missionId),
  userIdIdx: index('mission_progress_user_id_idx').on(table.userId)
}));

export type MissionProgress = typeof missionProgress.$inferSelect;
export type InsertMissionProgress = typeof missionProgress.$inferInsert;