import { pgTable, /*integer,*/ timestamp, primaryKey, uuid, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { badges } from './badges';

export const userBadges = pgTable(
	'user_badges',
	{
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		badgeId: integer('badge_id')
			.notNull()
			.references(() => badges.id, { onDelete: 'cascade' }),
		awardedAt: timestamp('awarded_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.badgeId] })
	})
);

// Add zod schema or relations as needed
// export type UserBadge = typeof userBadges.$inferSelect;
// export type InsertUserBadge = typeof userBadges.$inferInsert;
