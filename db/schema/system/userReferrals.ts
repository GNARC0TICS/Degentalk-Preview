import { pgTable, serial, integer, timestamp, boolean, jsonb, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { referralSources } from './referralSources';

export const userReferrals = pgTable(
  'user_referrals',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    referredByUserId: integer('referred_by_user_id').references(() => users.id, { onDelete: 'set null' }),
    referralSourceId: integer('referral_source_id').references(() => referralSources.id, { onDelete: 'set null' }),
    bonusGranted: boolean('bonus_granted').notNull().default(false),
    rewardMetadata: jsonb('reward_metadata').default('{}'),
    createdAt: timestamp('created_at').notNull().default(sql`now()`)
  },
  (table) => ({
    uniqueUser: unique('user_referrals_user_unique').on(table.userId)
  })
);

export type UserReferral = typeof userReferrals.$inferSelect; 