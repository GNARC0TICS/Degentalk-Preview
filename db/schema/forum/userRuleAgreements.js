import { pgTable, varchar, timestamp, primaryKey, index, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { forumRules } from './rules';
export const userRulesAgreements = pgTable('user_rules_agreements', {
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    ruleId: integer('rule_id')
        .notNull()
        .references(() => forumRules.id, { onDelete: 'cascade' }),
    versionHash: varchar('version_hash', { length: 255 }).notNull(),
    agreedAt: timestamp('agreed_at')
        .notNull()
        .default(sql `now()`)
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.ruleId] }),
    userIdx: index('idx_user_rules_agreements_user_id').on(table.userId)
}));
// export type InsertUserRulesAgreement = typeof userRulesAgreements.$inferInsert; // If needed
//# sourceMappingURL=userRuleAgreements.js.map