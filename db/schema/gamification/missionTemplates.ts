import { pgTable, varchar, integer, boolean, timestamp, uuid, text, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Mission enums
export const missionCategoryEnum = pgEnum('mission_category', [
  'participation',
  'social', 
  'trading',
  'content',
  'engagement',
  'achievement',
  'special_event',
  'vip_exclusive'
]);

export const missionTypeEnum = pgEnum('mission_type', [
  'count',      // Do X times
  'threshold',  // Reach X total
  'streak',     // X days in a row
  'timebound',  // Within X hours
  'combo',      // Multiple requirements
  'unique',     // First time only
  'competitive' // Top X users
]);

export const periodTypeEnum = pgEnum('period_type', [
  'daily',
  'weekly',
  'monthly',
  'special',
  'perpetual'
]);

// Mission Templates table - defines all possible missions
export const missionTemplates = pgTable('mission_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: missionCategoryEnum('category').notNull(),
  type: missionTypeEnum('type').notNull(),
  
  // Requirements configuration (JSONB)
  requirements: jsonb('requirements').notNull().default('{}').$type<{
    posts_created?: number;
    reactions_given?: number;
    reactions_received?: number;
    tips_sent?: number;
    tips_received?: number;
    min_tip_amount?: number;
    min_post_length?: number;
    threads_created?: number;
    unique_forums_posted?: number;
    rain_events?: number;
    unique_recipients?: number;
    [key: string]: any;
  }>(),
  
  // Rewards configuration (JSONB)
  rewards: jsonb('rewards').notNull().default('{}').$type<{
    xp?: number;
    dgt?: number;
    clout?: number;
    badge?: string;
    title?: string;
    avatar_frame?: string;
    items?: string[];
    [key: string]: any;
  }>(),
  
  // Prerequisites (JSONB)
  prerequisites: jsonb('prerequisites').default('{}').$type<{
    level?: number;
    badges?: string[];
    missions?: string[];
    xp?: number;
    dgt?: number;
    [key: string]: any;
  }>(),
  
  // Metadata for display and configuration
  metadata: jsonb('metadata').default('{}').$type<{
    icon?: string;
    color?: string;
    priority?: number;
    tags?: string[];
    [key: string]: any;
  }>(),
  
  weight: integer('weight').default(100), // For rotation probability
  minLevel: integer('min_level').default(1),
  maxLevel: integer('max_level'),
  cooldownHours: integer('cooldown_hours'), // Time before can be assigned again
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export type MissionTemplate = typeof missionTemplates.$inferSelect;
export type InsertMissionTemplate = typeof missionTemplates.$inferInsert;