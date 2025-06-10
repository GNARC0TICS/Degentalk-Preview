import { pgTable, serial, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "../user/users";
import { signatureShopItems } from "./signatureItems";

export const userSignatureItems = pgTable('user_signature_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  signatureItemId: integer('signature_item_id').notNull().references(() => signatureShopItems.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(false), // If this item is currently applied to user's signature
  purchaseDate: timestamp('purchase_date').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueUserItem: unique('user_signature_items_user_item_unique').on(table.userId, table.signatureItemId)
}));

// Add zod schema or relations as needed
// export type UserSignatureItem = typeof userSignatureItems.$inferSelect;
// export type InsertUserSignatureItem = typeof userSignatureItems.$inferInsert; 