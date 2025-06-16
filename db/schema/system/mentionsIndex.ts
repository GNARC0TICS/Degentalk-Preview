import { pgTable, serial, integer, timestamp, index, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { mentionSourceTypeEnum } from '../core/enums';

export const mentionsIndex = pgTable(
  'mentions_index',
  {
    id: serial('id').primaryKey(),
    sourceType: mentionSourceTypeEnum('source_type').notNull(), // post | thread | chat
    sourceId: integer('source_id').notNull(), // e.g., post_id, thread_id, chat_msg_id
    mentioningUserId: uuid('mentioning_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    mentionedUserId: uuid('mentioned_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().default(sql`now()`)
  },
  (table) => ({
    mentionedIdx: index('idx_mentions_mentioned_user').on(table.mentionedUserId),
    uniqueComposite: uniqueIndex('idx_mentions_unique').on(table.sourceType, table.sourceId, table.mentionedUserId)
  })
);

export type MentionIndex = typeof mentionsIndex.$inferSelect; 