import { pgTable, boolean, timestamp, unique, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { missions } from './missions'; // Adjusted path
export const userMissionProgress = pgTable('user_mission_progress', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    missionId: integer('mission_id')
        .notNull()
        .references(() => missions.id, { onDelete: 'cascade' }),
    currentCount: integer('current_count').notNull().default(0),
    isCompleted: boolean('is_completed').notNull().default(false),
    isRewardClaimed: boolean('is_reward_claimed').notNull().default(false),
    updatedAt: timestamp('updated_at').default(sql `now()`), // Changed defaultNow() to sql`now()`
    completedAt: timestamp('completed_at'),
    claimedAt: timestamp('claimed_at')
}, (table) => {
    return {
        userMissionIdx: unique('user_mission_idx').on(table.userId, table.missionId)
    };
});
//# sourceMappingURL=userMissionProgress.js.map