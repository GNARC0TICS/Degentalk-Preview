import { pgTable, timestamp, uuid, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { missionTemplates, periodTypeEnum } from './missionTemplates';

// Mission History - archives completed missions
export const missionHistory = pgTable('mission_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id')
    .notNull()
    .references(() => missionTemplates.id, { onDelete: 'cascade' }),
  
  completedAt: timestamp('completed_at').notNull(),
  rewardsGranted: jsonb('rewards_granted').notNull().$type<{
    xp?: number;
    dgt?: number;
    clout?: number;
    badge?: string;
    title?: string;
    avatar_frame?: string;
    items?: string[];
  }>(),
  
  timeToComplete: integer('time_to_complete'), // seconds
  periodType: periodTypeEnum('period_type').notNull(),
  
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Indexes for analytics and queries
  userIdIdx: index('mission_history_user_id_idx').on(table.userId),
  templateIdIdx: index('mission_history_template_id_idx').on(table.templateId),
  completedAtIdx: index('mission_history_completed_at_idx').on(table.completedAt)
}));

export type MissionHistory = typeof missionHistory.$inferSelect;
export type InsertMissionHistory = typeof missionHistory.$inferInsert;