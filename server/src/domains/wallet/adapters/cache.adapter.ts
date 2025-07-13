/**
 * Cache Wallet Adapter
 *
 * Provides caching layer for wallet operations
 * Can be used to cache balances, reduce API calls, and improve performance
 */

import type { UserId, TransactionId } from '@shared/types/ids';
import type {
	WalletBalance,
	DepositAddress,
	DgtTransaction,
	WithdrawalRequest,
	WithdrawalResponse,
	WebhookResult,
	PaginationOptions
} from '@shared/types/wallet/wallet.types';

import { logger } from '@core/logger';
import { WalletError, ErrorCodes } from '@core/errors';
import type { WalletAdapter } from './ccpayment.adapter';

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

export class CacheAdapter implements WalletAdapter {
	private cache = new Map<string, CacheEntry<any>>();
	private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

	constructor(private readonly underlyingAdapter: WalletAdapter) {}

	/**
	 * Get user balance with caching
	 */
	async getUserBalance(userId: UserId): Promise<WalletBalance> {
		const cacheKey = `balance:${userId}`;
		const cached = this.getFromCache<WalletBalance>(cacheKey);

		if (cached) {
			logger.debug('CacheAdapter', 'Balance cache hit', { userId });
			return cached;
		}

		logger.debug('CacheAdapter', 'Balance cache miss, fetching from underlying adapter', {
			userId
		});
		const balance = await this.underlyingAdapter.getUserBalance(userId);

		// Cache balance for 2 minutes (balances change frequently)
		this.setCache(cacheKey, balance, 2 * 60 * 1000);

		return balance;
	}

	/**
	 * Create deposit address (no caching - should be fresh each time)
	 */
	async createDepositAddress(
		userId: UserId,
		coinSymbol: string,
		chain: string
	): Promise<DepositAddress> {
		logger.debug('CacheAdapter', 'Creating deposit address (no cache)', {
			userId,
			coinSymbol,
			chain
		});

		return this.underlyingAdapter.createDepositAddress(userId, coinSymbol, chain);
	}

	/**
	 * Request withdrawal (no caching - always fresh)
	 */
	async requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse> {
		logger.debug('CacheAdapter', 'Processing withdrawal request (no cache)', { userId });

		// Invalidate balance cache since withdrawal will change it
		this.invalidateUserCache(userId);

		return this.underlyingAdapter.requestWithdrawal(userId, request);
	}

	/**
	 * Get transaction history with caching
	 */
	async getTransactionHistory(
		userId: UserId,
		options: PaginationOptions
	): Promise<DgtTransaction[]> {
		const cacheKey = `transactions:${userId}:${options.page}:${options.limit}:${options.sortBy}:${options.sortOrder}`;
		const cached = this.getFromCache<DgtTransaction[]>(cacheKey);

		if (cached) {
			logger.debug('CacheAdapter', 'Transaction history cache hit', { userId, options });
			return cached;
		}

		logger.debug('CacheAdapter', 'Transaction history cache miss', { userId, options });
		const transactions = await this.underlyingAdapter.getTransactionHistory(userId, options);

		// Cache transaction history for 5 minutes
		this.setCache(cacheKey, transactions, 5 * 60 * 1000);

		return transactions;
	}

	/**
	 * Process webhook (no caching)
	 */
	async processWebhook(payload: string, signature: string): Promise<WebhookResult> {
		logger.debug('CacheAdapter', 'Processing webhook (no cache)');

		const result = await this.underlyingAdapter.processWebhook(payload, signature);

		// If webhook was successful, invalidate relevant caches
		if (result.success) {
			this.invalidateAllBalanceCaches();
			this.invalidateAllTransactionCaches();
		}

		return result;
	}

	/**
	 * Get data from cache if not expired
	 */
	private getFromCache<T>(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		const now = Date.now();
		if (now - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set data in cache with TTL
	 */
	private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl
		});

		// Auto-cleanup expired entry
		setTimeout(() => {
			const entry = this.cache.get(key);
			if (entry && Date.now() - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}, ttl);
	}

	/**
	 * Invalidate all cache entries for a specific user
	 */
	private invalidateUserCache(userId: UserId): void {
		const keysToDelete: string[] = [];

		for (const key of this.cache.keys()) {
			if (key.includes(userId)) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => this.cache.delete(key));

		if (keysToDelete.length > 0) {
			logger.debug('CacheAdapter', 'Invalidated user cache entries', {
				userId,
				deletedKeys: keysToDelete.length
			});
		}
	}

	/**
	 * Invalidate all balance caches
	 */
	private invalidateAllBalanceCaches(): void {
		const keysToDelete: string[] = [];

		for (const key of this.cache.keys()) {
			if (key.startsWith('balance:')) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => this.cache.delete(key));

		if (keysToDelete.length > 0) {
			logger.debug('CacheAdapter', 'Invalidated all balance caches', {
				deletedKeys: keysToDelete.length
			});
		}
	}

	/**
	 * Invalidate all transaction caches
	 */
	private invalidateAllTransactionCaches(): void {
		const keysToDelete: string[] = [];

		for (const key of this.cache.keys()) {
			if (key.startsWith('transactions:')) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => this.cache.delete(key));

		if (keysToDelete.length > 0) {
			logger.debug('CacheAdapter', 'Invalidated all transaction caches', {
				deletedKeys: keysToDelete.length
			});
		}
	}

	/**
	 * Clear all cache entries
	 */
	clearAll(): void {
		const size = this.cache.size;
		this.cache.clear();
		logger.info('CacheAdapter', 'Cleared all cache entries', { previousSize: size });
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): {
		totalEntries: number;
		balanceEntries: number;
		transactionEntries: number;
		memoryUsage: string;
	} {
		let balanceEntries = 0;
		let transactionEntries = 0;

		for (const key of this.cache.keys()) {
			if (key.startsWith('balance:')) {
				balanceEntries++;
			} else if (key.startsWith('transactions:')) {
				transactionEntries++;
			}
		}

		// Rough memory estimation (not precise)
		const memoryUsage = `~${Math.round((this.cache.size * 1024) / 1024)}MB`;

		return {
			totalEntries: this.cache.size,
			balanceEntries,
			transactionEntries,
			memoryUsage
		};
	}
}
