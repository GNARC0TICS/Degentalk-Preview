/**
 * Dictionary Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { dictionaryEntries } from './entries';
import { dictionaryUpvotes } from './upvotes';
import { users } from '../user/users';
export const dictionaryEntriesRelations = relations(dictionaryEntries, ({ one, many }) => ({
  approver: one(users, {
    fields: [dictionaryEntries.approverId],
    references: [users.id]
  }),
}));
