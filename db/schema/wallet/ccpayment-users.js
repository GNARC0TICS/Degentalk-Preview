import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
/**
 * CCPayment Users - Maps Degentalk users to CCPayment user IDs
 */
export const ccpaymentUsers = pgTable('ccpayment_users', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    ccpaymentUserId: varchar('ccpayment_user_id', { length: 64 }).notNull().unique(),
    createdAt: timestamp('created_at')
        .notNull()
        .default(sql `now()`)
}, (table) => ({
    userIdx: index('idx_ccpayment_users_user_id').on(table.userId),
    ccpaymentUserIdx: index('idx_ccpayment_users_ccpayment_user_id').on(table.ccpaymentUserId)
}));
//# sourceMappingURL=ccpayment-users.js.map