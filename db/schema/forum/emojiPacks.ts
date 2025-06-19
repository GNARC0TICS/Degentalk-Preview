import {
	pgTable,
	serial,
	varchar,
	text,
	boolean,
	bigint,
	timestamp,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const emojiPacks = pgTable(
	'emoji_packs',
	{
		id: serial('pack_id').primaryKey(),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		iconUrl: varchar('icon_url', { length: 255 }),
		priceDgt: bigint('price_dgt', { mode: 'number' }),
		isFeatured: boolean('is_featured').notNull().default(false),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		nameIdx: index('idx_emoji_packs_name').on(table.name),
		featuredIdx: index('idx_emoji_packs_featured').on(table.isFeatured)
	})
);

export type EmojiPack = typeof emojiPacks.$inferSelect;
