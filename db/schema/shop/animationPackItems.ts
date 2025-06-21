import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { mediaLibrary } from '../admin/mediaLibrary';
import { animationPacks } from './animationPacks';

export const animationPackItems = pgTable('animation_pack_items', {
	id: serial('id').primaryKey(),
	packId: integer('pack_id')
		.references(() => animationPacks.id, { onDelete: 'cascade' })
		.notNull(),
	mediaId: integer('media_id')
		.references(() => mediaLibrary.id, { onDelete: 'cascade' })
		.notNull(),
	sortOrder: integer('sort_order').notNull().default(0)
});

export type AnimationPackItem = typeof animationPackItems.$inferSelect;
