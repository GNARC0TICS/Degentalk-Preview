import { pgTable, integer, varchar, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path
export const reportedContent = pgTable('reported_content', {
	id: uuid('id').primaryKey().defaultRandom(),
	reporterId: uuid('reporter_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	contentType: varchar('content_type', { length: 50 }).notNull(),
	contentId: integer('content_id').notNull(), // This would refer to an ID in posts, threads, etc. Consider polymorphic relation or separate tables if needed.
	reason: varchar('reason', { length: 100 }).notNull(),
	details: text('details'),
	status: varchar('status', { length: 50 }).notNull().default('pending'), // e.g., pending, reviewed, action_taken, dismissed
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`), // Changed defaultNow() to sql`now()`
	resolvedAt: timestamp('resolved_at'),
	resolvedBy: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
	resolutionNotes: text('resolution_notes')
});
export type ReportedContent = typeof reportedContent.$inferSelect;
// Add InsertReportedContent if Zod schema is needed
