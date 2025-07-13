import { pgTable, varchar, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
export const seoMetadata = pgTable('seo_metadata', {
    id: uuid('id').primaryKey().defaultRandom(),
    path: varchar('path', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    keywords: text('keywords'), // Comma-separated or handled by app logic
    ogImage: varchar('og_image', { length: 255 }),
    canonicalUrl: varchar('canonical_url', { length: 255 }),
    robots: varchar('robots', { length: 100 }), // e.g., "index, follow", "noindex, nofollow"
    updatedAt: timestamp('updated_at')
        .notNull()
        .default(sql `now()`), // Changed defaultNow() to sql`now()`
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }) // Changed to uuid
});
// Add InsertSeoMetadata if Zod schema is needed
//# sourceMappingURL=seoMetadata.js.map