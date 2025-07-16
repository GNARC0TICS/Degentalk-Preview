import { pgTable, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { missionTemplates, periodTypeEnum } from './missionTemplates';

// Active Mission Instances - tracks assigned missions to users
export const activeMissions = pgTable('active_missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id')
    .notNull()
    .references(() => missionTemplates.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  periodType: periodTypeEnum('period_type').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  assignedAt: timestamp('assigned_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp('completed_at'),
  claimedAt: timestamp('claimed_at'),
  
  isFeatured: boolean('is_featured').default(false), // Highlighted missions
  
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  // Indexes for efficient queries
  userIdIdx: index('active_missions_user_id_idx').on(table.userId),
  templateIdIdx: index('active_missions_template_id_idx').on(table.templateId),
  periodIdx: index('active_missions_period_idx').on(table.periodType, table.periodEnd),
  completedIdx: index('active_missions_completed_idx').on(table.completedAt)
}));

export type ActiveMission = typeof activeMissions.$inferSelect;
export type InsertActiveMission = typeof activeMissions.$inferInsert;