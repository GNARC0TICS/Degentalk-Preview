import {
	pgTable, integer, varchar, timestamp, uuid,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
export const verificationTokens = pgTable('verification_tokens', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	token: varchar('token', { length: 64 }).notNull(), // Assuming token length
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`)
	// expiresAt: timestamp('expires_at'), // Consider adding an expiry for tokens
});
// Add zod schema or relations as needed
// export type VerificationToken = typeof verificationTokens.$inferSelect;
// export type InsertVerificationToken = typeof verificationTokens.$inferInsert;
