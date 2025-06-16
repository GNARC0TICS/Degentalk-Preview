import { pgTable, integer, timestamp, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { roles } from './roles';
import { permissions } from './permissions';

export const rolePermissions = pgTable(
	'role_permissions',
	{
		roleId: integer('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		permId: integer('perm_id')
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' }),
		grantedAt: timestamp('granted_at')
			.notNull()
			.default(sql`now()`),
		grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' })
	},
	(table) => ({
		pk: primaryKey({ columns: [table.roleId, table.permId] })
	})
);

// Add zod schema or relations as needed
// export type RolePermission = typeof rolePermissions.$inferSelect;
// export type InsertRolePermission = typeof rolePermissions.$inferInsert;
