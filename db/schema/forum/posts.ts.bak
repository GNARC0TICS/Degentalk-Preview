import { pgTable, serial, integer, text, boolean, timestamp, uuid, bigint, jsonb, AnyPgColumn, index, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users"; // Adjusted import path
import { threads } from "./threads"; // Adjusted import path

export const contentEditStatusEnum = pgEnum('content_edit_status', [
  'draft',
  'pending_review',
  'published',
  'rejected',
  'archived',
]);

export const posts = pgTable('posts', {
  id: serial('post_id').primaryKey(),
  uuid: uuid('uuid').notNull().defaultRandom(),
  threadId: integer('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  replyToPostId: integer('reply_to_post_id').references((): AnyPgColumn => posts.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  editorState: jsonb('editor_state'),
  likeCount: integer('like_count').notNull().default(0),
  tipCount: integer('tip_count').notNull().default(0),
  totalTips: bigint('total_tips', { mode: 'number' }).notNull().default(0),
  isFirstPost: boolean('is_first_post').notNull().default(false),
  isHidden: boolean('is_hidden').notNull().default(false),
  isDeleted: boolean('is_deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  deletedBy: integer('deleted_by').references(() => users.id, { onDelete: 'set null' }),
  isEdited: boolean('is_edited').notNull().default(false),
  editedAt: timestamp('edited_at'),
  editedBy: integer('edited_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  quarantineData: jsonb('quarantine_data'),
  pluginData: jsonb('plugin_data').default('{}'),
}, (table) => ({
  threadIdx: index('idx_posts_thread_id').on(table.threadId),
  replyToIdx: index('idx_posts_reply_to').on(table.replyToPostId),
  userIdx: index('idx_posts_user_id').on(table.userId),
  totalTipsIdx: index('idx_posts_total_tips').on(table.totalTips)
}));

// Placeholder for relations
// import { relations } from "drizzle-orm";
// export const postsRelations = relations(posts, ({ one, many }) => ({
//   thread: one(threads, { fields: [posts.threadId], references: [threads.id] }),
//   user: one(users, { fields: [posts.userId], references: [users.id] }),
//   replyTo: one(posts, { fields: [posts.replyToPostId], references: [posts.id], relationName: 'replyToPost' }),
//   replies: many(posts, {relationName: 'replyToPost'}),
//   // ... other relations like reactions, tips
// }));

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertPostSchema = createInsertSchema(posts, {
  content: z.string().min(1)
}).omit({
  id: true,
  uuid: true,
  likeCount: true,
  tipCount: true,
  totalTips: true,
  isFirstPost: true,
  isHidden: true,
  isDeleted: true,
  deletedAt: true,
  deletedBy: true,
  isEdited: true,
  editedAt: true,
  editedBy: true,
  createdAt: true,
  updatedAt: true,
  quarantineData: true,
  pluginData: true,
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
