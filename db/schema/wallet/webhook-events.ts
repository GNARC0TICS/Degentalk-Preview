import { pgTable, uuid, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
/**
 * Webhook Events - Log all incoming webhook events from CCPayment
 */
export const webhookEvents = pgTable(
	'webhook_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		webhookId: varchar('webhook_id', { length: 255 }).notNull().unique(),
		eventType: varchar('event_type', { length: 50 }).notNull(), // deposit, withdraw, transfer, etc.
		status: varchar('status', { length: 20 }).notNull(), // received, processed, failed
		// Raw webhook data
		rawPayload: text('raw_payload').notNull(), // JSON string of the full webhook payload
		signature: varchar('signature', { length: 500 }), // Webhook signature for verification
		// Processing details
		isProcessed: boolean('is_processed').default(false),
		processedAt: timestamp('processed_at'),
		processingError: text('processing_error'), // Error message if processing failed
		retryCount: varchar('retry_count', { length: 10 }).default('0'),
		// Related record tracking
		relatedRecordType: varchar('related_record_type', { length: 50 }), // deposit, withdrawal, transfer, swap
		relatedRecordId: varchar('related_record_id', { length: 255 }), // Link to the related record
		receivedAt: timestamp('received_at')
			.notNull()
			.default(sql`now()`)
	},
	(table) => ({
		webhookIdIdx: index('idx_webhook_events_webhook_id').on(table.webhookId),
		eventTypeIdx: index('idx_webhook_events_event_type').on(table.eventType),
		statusIdx: index('idx_webhook_events_status').on(table.status),
		isProcessedIdx: index('idx_webhook_events_is_processed').on(table.isProcessed),
		relatedRecordIdx: index('idx_webhook_events_related_record').on(
			table.relatedRecordType,
			table.relatedRecordId
		),
		receivedAtIdx: index('idx_webhook_events_received_at').on(table.receivedAt)
	})
);
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
