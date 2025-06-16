import { pgTable, serial, integer, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const cooldownState = pgTable('cooldown_state', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    actionKey: varchar('action_key', { length: 100 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().default(sql`now()`),
    updatedAt: timestamp('updated_at').notNull().default(sql`now()`)
});

export type CooldownState = typeof cooldownState.$inferSelect; 