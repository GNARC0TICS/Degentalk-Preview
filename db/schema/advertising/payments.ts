import {
	pgTable,
	uuid,
	varchar,
	text,
	decimal,
	timestamp,
	boolean,
	jsonb,
	integer,
	pgEnum,
	index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { campaigns } from './campaigns';
import { threads } from '../forum/threads';

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', [
	'pending',
	'processing',
	'confirmed',
	'failed',
	'refunded',
	'disputed'
]);

// Cryptocurrency enum
export const cryptoCurrencyEnum = pgEnum('crypto_currency', [
	'DGT',
	'USDT',
	'BTC',
	'ETH',
	'USDC',
	'BNB'
]);

// Crypto payments for ad campaigns
export const cryptoPayments = pgTable('crypto_payments', {
	id: uuid('id').primaryKey().defaultRandom(),

	// Payment identification
	paymentHash: varchar('payment_hash', { length: 64 }).notNull().unique(),
	campaignId: uuid('campaign_id')
		.notNull()
		.references(() => campaigns.id, { onDelete: 'cascade' }),
	payerUserId: uuid('payer_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Payment details
	currency: cryptoCurrencyEnum('currency').notNull(),
	amount: decimal('amount', { precision: 18, scale: 8 }).notNull(), // Support high precision
	usdValue: decimal('usd_value', { precision: 12, scale: 2 }), // USD equivalent at time of payment

	// Blockchain transaction details
	transactionHash: varchar('transaction_hash', { length: 66 }), // 0x + 64 chars
	blockNumber: integer('block_number'),
	blockchainNetwork: varchar('blockchain_network', { length: 50 }),
	fromAddress: varchar('from_address', { length: 42 }),
	toAddress: varchar('to_address', { length: 42 }),

	// Payment processing
	status: paymentStatusEnum('status').notNull().default('pending'),
	confirmations: integer('confirmations').default(0),
	requiredConfirmations: integer('required_confirmations').default(3),

	// Fees and processing
	networkFee: decimal('network_fee', { precision: 18, scale: 8 }),
	platformFee: decimal('platform_fee', { precision: 12, scale: 2 }),
	processingFee: decimal('processing_fee', { precision: 12, scale: 2 }),

	// Metadata
	paymentMetadata: jsonb('payment_metadata').default('{}'),
	failureReason: text('failure_reason'),

	// Timestamps
	initiatedAt: timestamp('initiated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	confirmedAt: timestamp('confirmed_at'),
	expiresAt: timestamp('expires_at'),

	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

// Community governance for ad policies
export const adGovernanceProposals = pgTable('ad_governance_proposals', {
	id: uuid('id').primaryKey().defaultRandom(),

	// Proposal details
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description').notNull(),
	proposerUserId: uuid('proposer_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Proposal type and configuration
	proposalType: varchar('proposal_type', { length: 50 }).notNull(), // ad_policy, placement_rules, revenue_share
	proposedChanges: jsonb('proposed_changes').notNull(),
	currentConfiguration: jsonb('current_configuration'),

	// Voting mechanics
	votingStartAt: timestamp('voting_start_at').notNull(),
	votingEndAt: timestamp('voting_end_at').notNull(),
	requiredQuorum: integer('required_quorum').default(1000), // Minimum DGT tokens to vote

	// Vote tallies
	votesFor: integer('votes_for').default(0),
	votesAgainst: integer('votes_against').default(0),
	totalVotingPower: decimal('total_voting_power', { precision: 18, scale: 2 }).default('0'),

	// Proposal status
	status: varchar('status', { length: 20 }).default('draft'), // draft, active, passed, rejected, executed
	executedAt: timestamp('executed_at'),
	executionResult: jsonb('execution_result'),

	// Community engagement
	discussionThreadId: uuid('discussion_thread_id')
		.references(() => threads.id, { onDelete: 'set null' }), // Link to forum thread

	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp('updated_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

// Individual votes on governance proposals
export const adGovernanceVotes = pgTable('ad_governance_votes', {
	id: uuid('id').primaryKey().defaultRandom(),

	proposalId: uuid('proposal_id')
		.notNull()
		.references(() => adGovernanceProposals.id, { onDelete: 'cascade' }),
	voterUserId: uuid('voter_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),

	// Vote details
	vote: varchar('vote', { length: 10 }).notNull(), // for, against, abstain
	votingPower: decimal('voting_power', { precision: 18, scale: 2 }).notNull(), // DGT tokens held

	// Vote metadata
	voteReason: text('vote_reason'),
	delegatedFrom: uuid('delegated_from'), // If vote was delegated

	createdAt: timestamp('created_at')
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
});

export type CryptoPayment = typeof cryptoPayments.$inferSelect;
export type InsertCryptoPayment = typeof cryptoPayments.$inferInsert;
export type AdGovernanceProposal = typeof adGovernanceProposals.$inferSelect;
export type AdGovernanceVote = typeof adGovernanceVotes.$inferSelect;
