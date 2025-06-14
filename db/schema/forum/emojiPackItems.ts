import { pgTable, serial, integer, index } from 'drizzle-orm/pg-core';
import { emojiPacks } from './emojiPacks';
import { customEmojis } from './customEmojis';

export const emojiPackItems = pgTable(
  'emoji_pack_items',
  {
    id: serial('id').primaryKey(),
    packId: integer('pack_id').notNull().references(() => emojiPacks.id, { onDelete: 'cascade' }),
    emojiId: integer('emoji_id').notNull().references(() => customEmojis.id, { onDelete: 'cascade' }),
    position: integer('position').notNull().default(0)
  },
  (table) => ({
    packEmojiIdx: index('idx_pack_emoji_unique').on(table.packId, table.emojiId)
  })
);

export type EmojiPackItem = typeof emojiPackItems.$inferSelect; 