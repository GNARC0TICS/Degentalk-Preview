import { pgTable, serial, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { rolesConfig } from '@/config/roles.config.ts'; // [CONFIG-REFAC] roles config import

export const roles = pgTable('roles', {
  id: serial('role_id').primaryKey(),
  name: varchar('role_name', { length: 50 }).notNull().unique(),
  description: text('description'),
  isSystemRole: boolean('is_system_role').notNull().default(false),
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Add zod schema or relations as needed
// export type Role = typeof roles.$inferSelect;
// export type InsertRole = typeof roles.$inferInsert; 

// [CONFIG-REFAC] All role definitions and usages should now reference rolesConfig.roles 