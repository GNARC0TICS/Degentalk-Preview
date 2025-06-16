import {
	pgTable,
	uuid,
	varchar,
	text,
	jsonb,
	boolean,
	timestamp,
	index,
	// integer // No longer importing integer as userId will be uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { eventLogs } from './event_logs';
import { notificationTypeEnum } from '../core/enums';

export const notifications = pgTable(
	'notifications',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		eventType: notificationTypeEnum('event_type').notNull(),
		eventLogId: uuid('event_log_id').references(() => eventLogs.id),
		title: varchar('title', { length: 255 }).notNull(),
		body: text('body'),
		data: jsonb('data'), // For storing context like threadId, postId, achievementId, etc.
		isRead: boolean('is_read').notNull().default(false),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		// Index on user_id and is_read for efficient unread notification queries
		userReadIdx: index('idx_notifications_user_read').on(table.userId, table.isRead),
		// Index on user_id and created_at for chronological notification feeds
		userCreatedIdx: index('idx_notifications_user_created').on(table.userId, table.createdAt)
	})
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
