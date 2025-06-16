import {
	pgTable,
	serial,
	// integer, // No longer using integer for userId
	varchar,
	jsonb,
	text,
	timestamp,
	index,
	uuid // Added uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path

// Consolidated from auditLogs and adminAuditLogs in shared/schema.ts
export const auditLogs = pgTable(
	'audit_logs',
	{
		id: serial('log_id').primaryKey(),
		userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }), // Nullable if action can be system-initiated. Changed to uuid
		action: varchar('action', { length: 100 }).notNull(),
		entityType: varchar('entity_type', { length: 100 }).notNull(), // Changed from 50 to 100 for consistency
		entityId: varchar('entity_id', { length: 100 }),
		before: jsonb('before'), // To store state before change
		after: jsonb('after'), // To store state after change
		details: jsonb('details').default('{}'), // Retained from adminAuditLogs for extra info
		ipAddress: varchar('ip_address', { length: 50 }), // Changed from 45 to 50 for consistency
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`) // Changed defaultNow() to sql`now()`
	},
	(table) => ({
		userIdx: index('idx_audit_logs_user_id').on(table.userId),
		entityTypeIdx: index('idx_audit_logs_entity_type').on(table.entityType),
		createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt)
	})
);

export type AuditLog = typeof auditLogs.$inferSelect;
// Add InsertAuditLog if Zod schema is needed
