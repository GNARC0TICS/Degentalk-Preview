/**
 * Cache Wallet Adapter
 *
 * Provides caching layer for wallet operations
 * Can be used to cache balances, reduce API calls, and improve performance
 */
import type { UserId } from '@shared/types/ids';
import type { WalletBalance, DepositAddress, DgtTransaction, WithdrawalRequest, WithdrawalResponse, WebhookResult, PaginationOptions } from '@shared/types';
import type { WalletAdapter } from './ccpayment.adapter';
export declare class CacheAdapter implements WalletAdapter {
    private readonly underlyingAdapter;
    private cache;
    private readonly DEFAULT_TTL;
    constructor(underlyingAdapter: WalletAdapter);
    /**
     * Get user balance with caching
     */
    getUserBalance(userId: UserId): Promise<WalletBalance>;
    /**
     * Create deposit address (no caching - should be fresh each time)
     */
    createDepositAddress(userId: UserId, coinSymbol: string, chain: string): Promise<DepositAddress>;
    /**
     * Request withdrawal (no caching - always fresh)
     */
    requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse>;
    /**
     * Get transaction history with caching
     */
    getTransactionHistory(userId: UserId, options: PaginationOptions): Promise<DgtTransaction[]>;
    /**
     * Process webhook (no caching)
     */
    processWebhook(payload: string, signature: string): Promise<WebhookResult>;
    /**
     * Get data from cache if not expired
     */
    private getFromCache;
    /**
     * Set data in cache with TTL
     */
    private setCache;
    /**
     * Invalidate all cache entries for a specific user
     */
    private invalidateUserCache;
    /**
     * Invalidate all balance caches
     */
    private invalidateAllBalanceCaches;
    /**
     * Invalidate all transaction caches
     */
    private invalidateAllTransactionCaches;
    /**
     * Clear all cache entries
     */
    clearAll(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        totalEntries: number;
        balanceEntries: number;
        transactionEntries: number;
        memoryUsage: string;
    };
}
