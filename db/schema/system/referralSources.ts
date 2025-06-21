import {
	pgTable,
	serial,
	varchar,
	jsonb,
	integer,
	timestamp,
	index,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const referralSources = pgTable(
	'referral_sources',
	{
		id: serial('id').primaryKey(),
		name: varchar('name', { length: 100 }).notNull(),
		slug: varchar('slug', { length: 100 }).notNull(),
		metadata: jsonb('metadata').default('{}'),
		createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		slugUnique: unique('referral_sources_slug_unique').on(table.slug),
		nameUnique: unique('referral_sources_name_unique').on(table.name)
	})
);

export type ReferralSource = typeof referralSources.$inferSelect;
