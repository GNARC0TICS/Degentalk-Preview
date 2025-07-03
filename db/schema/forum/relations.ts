/**
 * Forum Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */

import { relations } from 'drizzle-orm';
import { customEmojis } from './customEmojis';
import { emojiPackItems } from './emojiPackItems';
import { emojiPacks } from './emojiPacks';
import { pollOptions } from './pollOptions';
import { pollVotes } from './pollVotes';
import { polls } from './polls';
import { postDrafts } from './postDrafts';
import { postLikes } from './postLikes';
import { postReactions } from './postReactions';
import { posts } from './posts';
import { threadPrefixes } from './threadPrefixes';
import { forumRules } from './forumRules';
import { forumStructure } from './forumStructure';
import { tags } from './tags';
import { userThreadBookmarks } from './userThreadBookmarks';
import { threadDrafts } from './threadDrafts';
import { threadFeaturePermissions } from './threadFeaturePermissions';
import { threadTags } from './threadTags';
import { threads } from './threads';
import { userEmojiPacks } from './userEmojiPacks';
import { userRulesAgreements } from './userRulesAgreements';
import { users } from '../user';

export const customEmojisRelations = relations(customEmojis, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [customEmojis.createdBy],
    references: [users.id]
  }),
}));

export const emojiPacksRelations = relations(emojiPacks, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [emojiPacks.createdBy],
    references: [users.id]
  }),
}));

export const postDraftsRelations = relations(postDrafts, ({ one, many }) => ({
  thread: one(threads, {
    fields: [postDrafts.threadId],
    references: [threads.id]
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  deletedBy: one(users, {
    fields: [posts.deletedBy],
    references: [users.id]
  }),
  editedBy: one(users, {
    fields: [posts.editedBy],
    references: [users.id]
  }),
}));

export const forumRulesRelations = relations(forumRules, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [forumRules.createdBy],
    references: [users.id]
  }),
  updatedBy: one(users, {
    fields: [forumRules.updatedBy],
    references: [users.id]
  }),
}));

export const threadDraftsRelations = relations(threadDrafts, ({ one, many }) => ({
  structure: one(forumStructure, {
    fields: [threadDrafts.structureId],
    references: [forumStructure.id]
  }),
  prefix: one(threadPrefixes, {
    fields: [threadDrafts.prefixId],
    references: [threadPrefixes.id]
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  prefix: one(threadPrefixes, {
    fields: [threads.prefixId],
    references: [threadPrefixes.id]
  }),
  featuredBy: one(users, {
    fields: [threads.featuredBy],
    references: [users.id]
  }),
  deletedBy: one(users, {
    fields: [threads.deletedBy],
    references: [users.id]
  }),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  postDrafts: many(postDrafts),
}));

export const forumStructureRelations = relations(forumStructure, ({ one, many }) => ({
  threadDrafts: many(threadDrafts),
}));

export const threadPrefixesRelations = relations(threadPrefixes, ({ one, many }) => ({
  threadDrafts: many(threadDrafts),
  threads: many(threads),
}));

