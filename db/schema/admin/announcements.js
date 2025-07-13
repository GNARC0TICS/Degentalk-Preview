import { pgTable, text, varchar, boolean, timestamp, jsonb, index, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const announcements = pgTable('announcements', {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    icon: varchar('icon', { length: 50 }),
    type: varchar('type', { length: 30 }).default('info'), // e.g., info, warning, success, critical
    isActive: boolean('is_active').notNull().default(true),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `now()`), // Changed defaultNow() to sql`now()`
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `now()`), // Changed defaultNow() to sql`now()`
    expiresAt: timestamp('expires_at'),
    priority: integer('priority').default(0),
    visibleTo: jsonb('visible_to')
        .$type()
        .default(sql `'["all"]'::jsonb`), // Storing as JSON string array
    tickerMode: boolean('ticker_mode').default(true),
    link: varchar('link', { length: 255 }),
    bgColor: varchar('bg_color', { length: 30 }),
    textColor: varchar('text_color', { length: 30 })
}, (table) => ({
    createdByIdx: index('idx_announcements_created_by').on(table.createdBy),
    createdAtIdx: index('idx_announcements_created_at').on(table.createdAt)
}));
export const insertAnnouncementSchema = createInsertSchema(announcements, {
    content: z.string().min(1, 'Content is required'),
    isActive: z.boolean().default(true),
    visibleTo: z.array(z.string()).default(['all']),
    priority: z.number().default(0),
    tickerMode: z.boolean().default(true)
}).omit({ id: true, createdAt: true, updatedAt: true }); // createdBy will be set by system
//# sourceMappingURL=announcements.js.map