import { pgTable, integer, uuid } from 'drizzle-orm/pg-core';
import { mediaLibrary } from '../admin/mediaLibrary';
import { animationPacks } from './animationPacks';
export const animationPackItems = pgTable('animation_pack_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    packId: uuid('pack_id')
        .references(() => animationPacks.id, { onDelete: 'cascade' })
        .notNull(),
    mediaId: uuid('media_id')
        .references(() => mediaLibrary.id, { onDelete: 'cascade' })
        .notNull(),
    sortOrder: integer('sort_order').notNull().default(0)
});
//# sourceMappingURL=animationPackItems.js.map