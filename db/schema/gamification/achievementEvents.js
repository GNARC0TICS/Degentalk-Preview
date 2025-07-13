import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
export const achievementEvents = pgTable('achievement_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    eventData: jsonb('event_data').notNull().default('{}'),
    triggeredAt: timestamp('triggered_at')
        .notNull()
        .default(sql `now()`),
    processedAt: timestamp('processed_at'),
    processingStatus: varchar('processing_status', { length: 20 }).notNull().default('pending')
});
//# sourceMappingURL=achievementEvents.js.map