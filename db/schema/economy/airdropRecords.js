import { pgTable, varchar, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user/users'; // Assuming path to users
export const airdropRecords = pgTable('airdrop_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    tokenType: varchar('token_type', { length: 50 }),
    amount: integer('amount'),
    createdAt: timestamp('created_at').defaultNow()
});
//# sourceMappingURL=airdropRecords.js.map