/**
 * Cache Wallet Adapter
 *
 * Provides caching layer for wallet operations
 * Can be used to cache balances, reduce API calls, and improve performance
 */
import { logger } from '@core/logger';
export class CacheAdapter {
    underlyingAdapter;
    cache = new Map();
    DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    constructor(underlyingAdapter) {
        this.underlyingAdapter = underlyingAdapter;
    }
    /**
     * Get user balance with caching
     */
    async getUserBalance(userId) {
        const cacheKey = `balance:${userId}`;
        const cached = this.getFromCache(cacheKey);
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
    async createDepositAddress(userId, coinSymbol, chain) {
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
    async requestWithdrawal(userId, request) {
        logger.debug('CacheAdapter', 'Processing withdrawal request (no cache)', { userId });
        // Invalidate balance cache since withdrawal will change it
        this.invalidateUserCache(userId);
        return this.underlyingAdapter.requestWithdrawal(userId, request);
    }
    /**
     * Get transaction history with caching
     */
    async getTransactionHistory(userId, options) {
        const cacheKey = `transactions:${userId}:${options.page}:${options.limit}:${options.sortBy}:${options.sortOrder}`;
        const cached = this.getFromCache(cacheKey);
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
    async processWebhook(payload, signature) {
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
    getFromCache(key) {
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
    setCache(key, data, ttl = this.DEFAULT_TTL) {
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
    invalidateUserCache(userId) {
        const keysToDelete = [];
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
    invalidateAllBalanceCaches() {
        const keysToDelete = [];
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
    invalidateAllTransactionCaches() {
        const keysToDelete = [];
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
    clearAll() {
        const size = this.cache.size;
        this.cache.clear();
        logger.info('CacheAdapter', 'Cleared all cache entries', { previousSize: size });
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        let balanceEntries = 0;
        let transactionEntries = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith('balance:')) {
                balanceEntries++;
            }
            else if (key.startsWith('transactions:')) {
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
