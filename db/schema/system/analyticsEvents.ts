import {
	pgTable,
	serial,
	integer,
	uuid,
	varchar,
	jsonb,
	text,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users'; // Adjusted path

export const analyticsEvents = pgTable(
	'analytics_events',
	{
		id: serial('event_id').primaryKey(),
		userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }), // Nullable if event is not user-specific
		sessionId: uuid('session_id'), // Can be used to group events from a single user session
		type: varchar('event_type', { length: 100 }).notNull(), // e.g., 'page_view', 'button_click', 'form_submit'
		data: jsonb('data').notNull().default('{}'), // Event-specific payload
		ipAddress: varchar('ip_address', { length: 50 }),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`) // Changed defaultNow() to sql`now()`
	},
	(table) => ({
		userIdx: index('idx_analytics_events_user_id').on(table.userId),
		typeIdx: index('idx_analytics_events_type').on(table.type),
		createdAtIdx: index('idx_analytics_events_created_at').on(table.createdAt)
	})
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
// Add InsertAnalyticsEvent if Zod schema is needed
