import { pgTable, uuid, integer, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { avatarFrames } from './avatarFrames';
/**
 * user_owned_frames – join table mapping which avatar frames a user owns.
 *
 * This table enables purchase history, airdrop/reward tracking, and equips.
 */
export const userOwnedFrames = pgTable('user_owned_frames', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	frameId: uuid('frame_id')
		.references(() => avatarFrames.id, { onDelete: 'cascade' })
		.notNull(),
	/**
	 * Source denotes where the frame came from: e.g. `shop`, `level`, `admin`.
	 * A small VARCHAR is sufficient; if this grows, convert to enum later.
	 */
	source: varchar('source', { length: 20 }).notNull().default('shop'),
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});
export type UserOwnedFrame = typeof userOwnedFrames.$inferSelect;
export type InsertUserOwnedFrame = typeof userOwnedFrames.$inferInsert;
