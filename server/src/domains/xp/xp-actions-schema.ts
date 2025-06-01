/**
 * XP Actions Schema
 * 
 * Schema definition for the XP actions logs table
 * This will be used to track all XP awards from actions
 */

import { pgTable, serial, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from '@db/schema';

/**
 * xpActionLogs table schema
 * 
 * This table tracks when users earn XP through system actions.
 * Unlike xpAdjustmentLogs (which tracks admin adjustments),
 * this tracks automatic XP awards from regular platform usage.
 */
export const xpActionLogs = pgTable('xp_action_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // Matches XP_ACTION enum values
  amount: integer('amount').notNull(),
  metadata: jsonb('metadata'), // Store related data (e.g., postId, threadId)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // No need for oldXp/newXp fields as this isn't about adjustments
});

/**
 * Future schema for tracking XP action rate limits
 * Will be used to enforce cooldowns and daily limits
 */
export const xpActionLimits = pgTable('xp_action_limits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // Matches XP_ACTION enum values
  count: integer('count').notNull().default(1),
  lastAwarded: timestamp('last_awarded').notNull().defaultNow(),
  dayStartedAt: timestamp('day_started_at').notNull().defaultNow(), // To track daily limits
});

// Type definitions for TypeScript
export type XpActionLog = typeof xpActionLogs.$inferSelect;
export type InsertXpActionLog = typeof xpActionLogs.$inferInsert;

export type XpActionLimit = typeof xpActionLimits.$inferSelect;
export type InsertXpActionLimit = typeof xpActionLimits.$inferInsert; 