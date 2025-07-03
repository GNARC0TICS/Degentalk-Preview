/**
 * Dictionary Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */

import { relations } from 'drizzle-orm';
import { dictionaryEntries } from './dictionaryEntries';
import { dictionaryUpvotes } from './dictionaryUpvotes';
import { users } from '../user';

export const dictionaryEntriesRelations = relations(dictionaryEntries, ({ one, many }) => ({
  approver: one(users, {
    fields: [dictionaryEntries.approverId],
    references: [users.id]
  }),
}));

