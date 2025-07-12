import {
	pgTable, text, boolean, timestamp, uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const avatarFrames = pgTable('avatar_frames', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	imageUrl: text('image_url').notNull(),
	rarity: text('rarity').default('common'),
	animated: boolean('animated').default(false),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
},
	(table) => ({
		idx_avatarFrames_createdAt: index('idx_avatarFrames_createdAt').on(table.createdAt),
	}));
export type AvatarFrame = typeof avatarFrames.$inferSelect;
export type InsertAvatarFrame = typeof avatarFrames.$inferInsert; // Assuming full insert schema is okay
