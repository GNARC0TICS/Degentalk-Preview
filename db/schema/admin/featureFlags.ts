import {
	pgTable,
	serial,
	varchar,
	text,
	boolean,
	integer,
	timestamp,
	jsonb
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path

// Consolidated from betaFeatureFlags and featureFlags in shared/schema.ts
export const featureFlags = pgTable('feature_flags', {
	id: serial('flag_id').primaryKey(),
	key: varchar('key', { length: 100 }).notNull().unique(), // This was from featureFlags, good practice
	name: varchar('name', { length: 100 }).notNull(), // from betaFeatureFlags, good for display
	description: text('description'),
	isEnabled: boolean('is_enabled').notNull().default(false), // Renamed from 'enabled' for clarity
	config: jsonb('config').notNull().default('{}'), // From featureFlags, useful for complex flags
	accessCode: varchar('access_code', { length: 100 }), // From betaFeatureFlags, for controlled access
	expiresAt: timestamp('expires_at'), // From betaFeatureFlags
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`), // Changed defaultNow() to sql`now()`
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`), // Changed defaultNow() to sql`now()`
	createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
	updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' })
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
// Add InsertFeatureFlag if Zod schema is needed
