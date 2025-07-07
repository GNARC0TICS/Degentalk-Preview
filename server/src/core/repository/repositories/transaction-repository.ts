/**
 * Transaction Repository Implementation
 *
 * QUALITY IMPROVEMENT: Repository pattern for Transaction data access
 * Implements ITransactionRepository interface with proper error handling and type safety
 */

import { db } from '@db';
import type { UserId } from '@shared/types/ids';
import { transactions } from '@schema';
import { eq, and, desc, asc, sum, sql } from 'drizzle-orm';
import {
	BaseRepository,
	RepositoryError,
	type PaginatedResult,
	type QueryOptions
} from '../base-repository';
import type { ITransactionRepository } from '../interfaces';
import type { Transaction } from '@schema';
import { logger } from '@server/src/core/logger';

export class TransactionRepository
	extends BaseRepository<Transaction>
	implements ITransactionRepository
{
	protected table = transactions;
	protected entityName = 'Transaction';

	/**
	 * Find transactions by user ID with pagination
	 */
	async findByUserId(
		userId: UserId,
		options: QueryOptions = {}
	): Promise<PaginatedResult<Transaction>> {
		try {
			const queryOptions = {
				...options,
				filters: {
					...options.filters,
					userId
				},
				sort: options.sort || [{ column: 'createdAt', direction: 'desc' as const }]
			};

			const result = await this.findPaginated(queryOptions);

			logger.debug('TransactionRepository', 'Found transactions by user', {
				userId,
				count: result.data.length,
				total: result.total
			});

			return result;
		} catch (error) {
			logger.error('TransactionRepository', 'Error in findByUserId', { userId, options, error });
			throw new RepositoryError(
				'Failed to find transactions by user ID',
				'FIND_BY_USER_ID_ERROR',
				500,
				{ userId, options, originalError: error }
			);
		}
	}

	/**
	 * Find transactions by type with pagination
	 */
	async findByType(
		type: string,
		options: QueryOptions = {}
	): Promise<PaginatedResult<Transaction>> {
		try {
			const queryOptions = {
				...options,
				filters: {
					...options.filters,
					type
				},
				sort: options.sort || [{ column: 'createdAt', direction: 'desc' as const }]
			};

			const result = await this.findPaginated(queryOptions);

			logger.debug('TransactionRepository', 'Found transactions by type', {
				type,
				count: result.data.length,
				total: result.total
			});

			return result;
		} catch (error) {
			logger.error('TransactionRepository', 'Error in findByType', { type, options, error });
			throw new RepositoryError('Failed to find transactions by type', 'FIND_BY_TYPE_ERROR', 500, {
				type,
				options,
				originalError: error
			});
		}
	}

	/**
	 * Find transactions by status with pagination
	 */
	async findByStatus(
		status: string,
		options: QueryOptions = {}
	): Promise<PaginatedResult<Transaction>> {
		try {
			const queryOptions = {
				...options,
				filters: {
					...options.filters,
					status
				},
				sort: options.sort || [{ column: 'createdAt', direction: 'desc' as const }]
			};

			const result = await this.findPaginated(queryOptions);

			logger.debug('TransactionRepository', 'Found transactions by status', {
				status,
				count: result.data.length,
				total: result.total
			});

			return result;
		} catch (error) {
			logger.error('TransactionRepository', 'Error in findByStatus', { status, options, error });
			throw new RepositoryError(
				'Failed to find transactions by status',
				'FIND_BY_STATUS_ERROR',
				500,
				{ status, options, originalError: error }
			);
		}
	}

	/**
	 * Get total transaction amount by user and optionally by type
	 */
	async getTotalByUser(userId: UserId, type?: string): Promise<number> {
		try {
			const conditions = [eq(transactions.userId, userId)];

			if (type) {
				conditions.push(eq(transactions.type, type));
			}

			const [result] = await db
				.select({
					total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
				})
				.from(transactions)
				.where(and(...conditions));

			const total = Number(result?.total || 0);

			logger.debug('TransactionRepository', 'Calculated total by user', {
				userId,
				type,
				total
			});

			return total;
		} catch (error) {
			logger.error('TransactionRepository', 'Error in getTotalByUser', { userId, type, error });
			throw new RepositoryError(
				'Failed to get total transactions by user',
				'GET_TOTAL_BY_USER_ERROR',
				500,
				{ userId, type, originalError: error }
			);
		}
	}

	/**
	 * Get balance by user (credits minus debits)
	 */
	async getBalanceByUser(userId: UserId): Promise<number> {
		try {
			// Calculate credits (positive transactions)
			const [creditsResult] = await db
				.select({
					credits: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
				})
				.from(transactions)
				.where(and(eq(transactions.userId, userId), sql`${transactions.amount} > 0`));

			// Calculate debits (negative transactions)
			const [debitsResult] = await db
				.select({
					debits: sql<number>`COALESCE(SUM(ABS(${transactions.amount})), 0)`
				})
				.from(transactions)
				.where(and(eq(transactions.userId, userId), sql`${transactions.amount} < 0`));

			const credits = Number(creditsResult?.credits || 0);
			const debits = Number(debitsResult?.debits || 0);
			const balance = credits - debits;

			logger.debug('TransactionRepository', 'Calculated balance by user', {
				userId,
				credits,
				debits,
				balance
			});

			return balance;
		} catch (error) {
			logger.error('TransactionRepository', 'Error in getBalanceByUser', { userId, error });
			throw new RepositoryError('Failed to get balance by user', 'GET_BALANCE_BY_USER_ERROR', 500, {
				userId,
				originalError: error
			});
		}
	}

	/**
	 * Get transactions by date range
	 */
	async findByDateRange(
		startDate: Date,
		endDate: Date,
		options: QueryOptions = {}
	): Promise<PaginatedResult<Transaction>> {
		try {
			const queryOptions = {
				...options,
				filters: {
					...options.filters,
					createdAt: {
						operator: 'gte',
						value: startDate
					}
					// Add end date filter using complex condition
				},
				sort: options.sort || [{ column: 'createdAt', direction: 'desc' as const }]
			};

			// For now, use simple date filtering - can be enhanced with proper date range queries
			const result = await this.findPaginated(queryOptions);

			// Filter by end date manually (should be optimized to database level)
			result.data = result.data.filter((transaction) => transaction.createdAt <= endDate);

			logger.debug('TransactionRepository', 'Found transactions by date range', {
				startDate,
				endDate,
				count: result.data.length
			});

			return result;
		} catch (error) {
			logger.error('TransactionRepository', 'Error in findByDateRange', {
				startDate,
				endDate,
				options,
				error
			});
			throw new RepositoryError(
				'Failed to find transactions by date range',
				'FIND_BY_DATE_RANGE_ERROR',
				500,
				{ startDate, endDate, options, originalError: error }
			);
		}
	}

	/**
	 * Get transaction statistics for a user
	 */
	async getUserStats(userId: UserId): Promise<{
		totalTransactions: number;
		totalCredits: number;
		totalDebits: number;
		balance: number;
		lastTransactionAt: Date | null;
	}> {
		try {
			const [statsResult] = await db
				.select({
					totalTransactions: sql<number>`COUNT(*)`,
					totalCredits: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
					totalDebits: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END), 0)`,
					lastTransactionAt: sql<Date | null>`MAX(${transactions.createdAt})`
				})
				.from(transactions)
				.where(eq(transactions.userId, userId));

			const totalCredits = Number(statsResult?.totalCredits || 0);
			const totalDebits = Number(statsResult?.totalDebits || 0);
			const balance = totalCredits - totalDebits;

			const stats = {
				totalTransactions: Number(statsResult?.totalTransactions || 0),
				totalCredits,
				totalDebits,
				balance,
				lastTransactionAt: statsResult?.lastTransactionAt || null
			};

			logger.debug('TransactionRepository', 'Calculated user stats', {
				userId,
				stats
			});

			return stats;
		} catch (error) {
			logger.error('TransactionRepository', 'Error in getUserStats', { userId, error });
			throw new RepositoryError(
				'Failed to get user transaction statistics',
				'GET_USER_STATS_ERROR',
				500,
				{ userId, originalError: error }
			);
		}
	}

	/**
	 * Prepare data for transaction creation with validation
	 */
	protected prepareCreateData(data: Partial<Transaction>): any {
		// Validate required fields
		if (!data.userId) {
			throw new RepositoryError('User ID is required for transaction', 'VALIDATION_ERROR', 400, {
				field: 'userId'
			});
		}

		if (!data.type) {
			throw new RepositoryError('Transaction type is required', 'VALIDATION_ERROR', 400, {
				field: 'type'
			});
		}

		if (data.amount === undefined || data.amount === null) {
			throw new RepositoryError('Transaction amount is required', 'VALIDATION_ERROR', 400, {
				field: 'amount'
			});
		}

		return {
			...data,
			status: data.status || 'pending',
			metadata: data.metadata || {},
			createdAt: new Date(),
			updatedAt: new Date()
		};
	}
}
