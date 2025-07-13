import { pgTable, varchar, text, integer, jsonb, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
export const achievements = pgTable('achievements', {
    id: uuid('id').primaryKey().defaultRandom(),
    // Basic info
    key: varchar('key', { length: 100 }).unique(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    // Organization
    category: varchar('category', { length: 50 }).notNull().default('participation'),
    tier: varchar('tier', { length: 20 }).notNull().default('common'),
    displayGroup: varchar('display_group', { length: 50 }),
    sortOrder: integer('sort_order').notNull().default(0),
    // Visual
    iconUrl: varchar('icon_url', { length: 255 }),
    iconEmoji: varchar('icon_emoji', { length: 10 }),
    // Trigger system
    triggerType: varchar('trigger_type', { length: 50 }).notNull().default('count'),
    triggerConfig: jsonb('trigger_config').notNull().default('{}'),
    // Legacy requirement field (for backward compatibility)
    requirement: jsonb('requirement').notNull().default('{}'),
    // Rewards
    rewardXp: integer('reward_xp').notNull().default(0),
    rewardPoints: integer('reward_points').notNull().default(0),
    rewardDgt: integer('reward_dgt').notNull().default(0),
    rewardClout: integer('reward_clout').notNull().default(0),
    // Behavior
    isActive: boolean('is_active').notNull().default(true),
    isSecret: boolean('is_secret').notNull().default(false),
    isRetroactive: boolean('is_retroactive').notNull().default(true),
    unlockMessage: text('unlock_message'),
    // Metadata
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `now()`),
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `now()`)
});
//# sourceMappingURL=achievements.js.map