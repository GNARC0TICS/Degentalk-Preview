import { pgTable, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { roles } from "./roles";

export const userRoles = pgTable('user_roles', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  grantedAt: timestamp('granted_at').notNull().default(sql`now()`),
  grantedBy: integer('granted_by').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] })
}));

// Add zod schema or relations as needed
// export type UserRole = typeof userRoles.$inferSelect;
// export type InsertUserRole = typeof userRoles.$inferInsert; 