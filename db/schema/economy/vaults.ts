import {
	pgTable,
	varchar,
	doublePrecision,
	timestamp,
	jsonb,
	text,
	index,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';
import { transactions } from './transactions'; // Assuming transactions is in the same economy domain
import { vaultStatusEnum } from '../core/enums';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
export const vaults = pgTable(
	'vaults',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id') // Changed to uuid
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
		amount: doublePrecision('amount').notNull(),
		initialAmount: doublePrecision('initial_amount').notNull(),
		lockedAt: timestamp('locked_at')
			.notNull()
			.default(sql`now()`),
		unlockTime: timestamp('unlock_time'),
		status: vaultStatusEnum('status').notNull().default('locked'),
		unlockedAt: timestamp('unlocked_at'),
		lockTransactionId: uuid('lock_transaction_id').references(() => transactions.id, {
			onDelete: 'set null'
		}),
		unlockTransactionId: uuid('unlock_transaction_id').references(() => transactions.id, {
			onDelete: 'set null'
		}),
		blockchainTxId: varchar('blockchain_tx_id', { length: 255 }),
		unlockBlockchainTxId: varchar('unlock_blockchain_tx_id', { length: 255 }),
		metadata: jsonb('metadata').default('{}'),
		createdAt: timestamp('created_at')
			.notNull()
			.default(sql`now()`),
		updatedAt: timestamp('updated_at')
			.notNull()
			.default(sql`now()`),
		notes: text('notes')
	},
	(table) => ({
		userIdx: index('idx_vaults_user_id').on(table.userId),
		statusIdx: index('idx_vaults_status').on(table.status),
		unlockTimeIdx: index('idx_vaults_unlock_time').on(table.unlockTime),
		walletAddressIdx: index('idx_vaults_wallet_address').on(table.walletAddress)
	})
);
const isDevelopment = () => process.env.NODE_ENV !== 'production';
const walletAddressSchema = z.union([
	z.string().min(34).max(34), // Basic length check for Tron addresses
	z
		.string()
		.refine(
			(addr) =>
				isDevelopment() &&
				['TREASURY_SYSTEM_TRON_ADDRESS', 'TRzJRNqjgmzCR4zwm6wLMnECDj35zZZnVt'].includes(addr),
			{ message: 'Invalid wallet address format for dev/test specific values' }
		)
]);
// @ts-ignore - drizzle-zod type inference issue with cross-workspace builds
export const insertVaultSchema = createInsertSchema(vaults, {
	walletAddress: walletAddressSchema,
	amount: z.number().positive(),
	unlockTime: z
		.date()
		.refine((date) => date > new Date(), {
			message: 'Unlock time must be in the future'
		})
		.optional()
		.nullable(),
	notes: z.string().optional()
}).omit({
	id: true,
	userId: true,
	initialAmount: true,
	lockedAt: true,
	status: true,
	unlockedAt: true,
	lockTransactionId: true,
	unlockTransactionId: true,
	blockchainTxId: true,
	unlockBlockchainTxId: true,
	metadata: true,
	createdAt: true,
	updatedAt: true
});
export type Vault = typeof vaults.$inferSelect;
export type InsertVault = z.infer<typeof insertVaultSchema>;
