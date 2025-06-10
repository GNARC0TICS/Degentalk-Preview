import { pgTable, serial, varchar, text, boolean, bigint, integer, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users";

export const customEmojis = pgTable('custom_emojis', {
  id: serial('emoji_id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  code: varchar('code', { length: 50 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().default('static'),
  url: text('url').notNull(),
  previewUrl: varchar('preview_url', { length: 255 }),
  category: varchar('category', { length: 50 }).default('standard'),
  isLocked: boolean('is_locked').notNull().default(true),
  unlockType: varchar('unlock_type', { length: 20 }).default('free'),
  priceDgt: bigint('price_dgt', { mode: 'number' }),
  requiredPath: varchar('required_path', { length: 50 }),
  requiredPathXP: integer('required_path_xp'),
  xpValue: integer('xp_value').notNull().default(0),
  cloutValue: integer('clout_value').notNull().default(0),
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  isDeleted: boolean('is_deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  nameIdx: index('idx_custom_emojis_name').on(table.name),
  categoryIdx: index('idx_custom_emojis_category').on(table.category),
  typeIdx: index('idx_custom_emojis_type').on(table.type),
  unlockTypeIdx: index('idx_custom_emojis_unlock_type').on(table.unlockType)
}));

export type CustomEmoji = typeof customEmojis.$inferSelect;
export type InsertCustomEmoji = typeof customEmojis.$inferInsert; // Assuming full insert schema is okay 