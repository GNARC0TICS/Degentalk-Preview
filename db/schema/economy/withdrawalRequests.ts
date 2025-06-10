import {
	pgTable,
	serial,
	integer,
	bigint,
	varchar,
	text,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { transactions } from './transactions';
import { withdrawalStatusEnum } from '../core/enums';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const withdrawalRequests = pgTable(
	'withdrawal_requests',
	{
		id: serial('request_id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		amount: bigint('amount', { mode: 'number' }).notNull(),
		status: withdrawalStatusEnum('status').notNull().default('pending'),
		walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
		transactionId: integer('transaction_id').references(() => transactions.id, {
			onDelete: 'set null'
		}),
		processingFee: bigint('processing_fee', { mode: 'number' }).notNull().default(0),
		requestNotes: text('request_notes'),
		adminNotes: text('admin_notes'),
		processed: boolean('processed').notNull().default(false),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		fulfilledAt: timestamp('fulfilled_at'),
		processedBy: integer('processed_by').references(() => users.id, { onDelete: 'set null' })
	},
	(table) => ({
		userIdx: index('idx_withdrawal_requests_user_id').on(table.userId),
		statusIdx: index('idx_withdrawal_requests_status').on(table.status),
		createdAtIdx: index('idx_withdrawal_requests_created_at').on(table.createdAt)
	})
);

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests, {
	amount: z.number().min(1),
	walletAddress: z.string().min(1).max(255)
}).omit({
	id: true,
	userId: true, // Added userId to omit as it should be set by the server context
	status: true,
	transactionId: true,
	processingFee: true,
	adminNotes: true,
	processed: true,
	createdAt: true,
	fulfilledAt: true,
	processedBy: true
});

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
