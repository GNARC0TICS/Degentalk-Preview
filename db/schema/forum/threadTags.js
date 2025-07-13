import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { threads } from './threads'; // Adjusted import
import { tags } from './tags'; // Adjusted import
export const threadTags = pgTable('thread_tags', {
    threadId: uuid('thread_id')
        .notNull()
        .references(() => threads.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
        .notNull()
        .references(() => tags.id, { onDelete: 'cascade' })
}, (table) => ({
    pk: primaryKey({ columns: [table.threadId, table.tagId] })
}));
//# sourceMappingURL=threadTags.js.map