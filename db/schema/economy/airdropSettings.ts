import { pgTable, serial, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { userGroups } from "../user/userGroups"; // Assuming path to userGroups

export const airdropSettings = pgTable('airdrop_settings', {
  id: serial('id').primaryKey(),
  tokenType: varchar('token_type', { length: 50 }).notNull(), // 'DGT' or 'XP'
  amount: integer('amount').notNull(),
  interval: varchar('interval', { length: 50 }).default('daily'), // daily, weekly, one-time
  targetGroupId: integer('target_group_id').references(() => userGroups.id), // Corrected column name to match convention
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export type AirdropSetting = typeof airdropSettings.$inferSelect;
export type InsertAirdropSetting = typeof airdropSettings.$inferInsert; 