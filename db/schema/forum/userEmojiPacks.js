import { pgTable, timestamp, text, index, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { emojiPacks } from './emojiPacks';
export const userEmojiPacks = pgTable('user_emoji_packs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    emojiPackId: integer('emoji_pack_id')
        .notNull()
        .references(() => emojiPacks.id, { onDelete: 'cascade' }),
    unlockedAt: timestamp('unlocked_at')
        .notNull()
        .default(sql `now()`),
    unlockType: text('unlock_type').notNull().default('shop'), // shop | admin | xp_reward
    pricePaid: integer('price_paid') // DGT amount, nullable
}, (table) => ({
    userPackIdx: index('idx_user_pack_unique').on(table.userId, table.emojiPackId)
}));
//# sourceMappingURL=userEmojiPacks.js.map