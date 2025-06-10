import { pgTable, serial, varchar, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const scheduledTasks = pgTable('scheduled_tasks', {
	id: serial('task_id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description'),
	taskType: varchar('task_type', { length: 50 }).notNull(), // e.g., 'send_newsletter', 'recalculate_hot_scores'
	frequency: varchar('frequency', { length: 50 }).notNull(), // For human readability, e.g., 'daily', 'hourly'
	cronExpression: varchar('cron_expression', { length: 100 }), // For programmatic execution
	isActive: boolean('is_active').notNull().default(true),
	lastRunAt: timestamp('last_run_at'),
	nextRunAt: timestamp('next_run_at'),
	lastStatus: varchar('last_status', { length: 50 }), // e.g., 'success', 'failed'
	lastRunDetails: jsonb('last_run_details').default('{}'), // Store output or error messages
	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`now()`), // Changed defaultNow() to sql`now()`
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`now()`) // Changed defaultNow() to sql`now()`
});

export type ScheduledTask = typeof scheduledTasks.$inferSelect;
// Add InsertScheduledTask if Zod schema is needed
