import { pgTable, text, varchar, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
export const userBans = pgTable('user_bans', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    bannedBy: uuid('banned_by')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }), // Assuming bannedBy is also a user
    reason: text('reason').notNull(),
    banType: varchar('ban_type', { length: 50 }).notNull(),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `now()`),
    expiresAt: timestamp('expires_at'),
    isActive: boolean('is_active').notNull().default(true),
    liftedAt: timestamp('lifted_at'),
    liftedBy: uuid('lifted_by').references(() => users.id, { onDelete: 'set null' }),
    liftingReason: text('lifting_reason')
});
// export type InsertUserBan = typeof userBans.$inferInsert; // If needed
//# sourceMappingURL=bans.js.map