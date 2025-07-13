import { pgTable, uuid, integer, numeric, text, inet, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
export const profileAnalytics = pgTable('profile_analytics', {
    id: uuid('id').primaryKey().defaultRandom(),
    profileUserId: uuid('profile_user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    viewerUserId: uuid('viewer_user_id').references(() => users.id, { onDelete: 'set null' }), // NULL for anonymous viewers
    sessionDuration: integer('session_duration').notNull(), // milliseconds
    tabSwitches: integer('tab_switches').notNull().default(0),
    actionsPerformed: integer('actions_performed').notNull().default(0),
    scrollDepth: numeric('scroll_depth', { precision: 3, scale: 2 }).notNull().default('0.00'), // 0.00 to 1.00
    engagementScore: integer('engagement_score').notNull().default(0), // 0 to 100
    userAgent: text('user_agent'),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
}, (table) => ({
    profileUserIdx: index('idx_profile_analytics_profile_user').on(table.profileUserId),
    viewerIdx: index('idx_profile_analytics_viewer').on(table.viewerUserId),
    createdIdx: index('idx_profile_analytics_created').on(table.createdAt),
    engagementIdx: index('idx_profile_analytics_engagement').on(table.engagementScore)
}));
//# sourceMappingURL=profileAnalytics.js.map