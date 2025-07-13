import { pgTable, varchar, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `CURRENT_TIMESTAMP`)
});
// Add zod schema or relations as needed
// import { createInsertSchema } from "drizzle-zod";
// export const insertTagSchema = createInsertSchema(tags);
// export type Tag = typeof tags.$inferSelect;
// export type InsertTag = typeof tags.$inferInsert;
//# sourceMappingURL=tags.js.map