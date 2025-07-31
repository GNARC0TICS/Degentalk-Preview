/**
 * Cache Stampede Protection
 *
 * Prevents multiple concurrent requests from triggering the same expensive operation
 * when cache misses occur. Uses in-memory request deduplication.
 */
declare class StampedeProtection {
    private pendingRequests;
    private readonly maxPendingTime;
    private readonly cleanupInterval;
    private cleanupTimer?;
    constructor();
    /**
     * Execute operation with stampede protection
     * Multiple requests with same key will wait for the first one to complete
     */
    execute<T>(key: string, operation: () => Promise<T>): Promise<T>;
    /**
     * Execute operation and clean up after completion
     */
    private executeWithCleanup;
    /**
     * Get current pending request count for monitoring
     */
    getPendingCount(): number;
    /**
     * Get pending requests info for debugging
     */
    getPendingRequests(): Array<{
        key: string;
        age: number;
        requestCount: number;
    }>;
    /**
     * Clear all pending requests (for testing)
     */
    clear(): void;
    /**
     * Start periodic cleanup of timed out requests
     */
    private startCleanup;
    /**
     * Clean up timed out pending requests
     */
    private cleanup;
    /**
     * Stop cleanup timer (for graceful shutdown)
     */
    destroy(): void;
}
export declare const stampedeProtection: StampedeProtection;
/**
 * Decorator to add stampede protection to methods
 * Use this on expensive operations that might be called concurrently
 */
export declare function ProtectStampede(keyPrefix?: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Manual stampede protection for functional code
 */
export declare function withStampedeProtection<T>(key: string, operation: () => Promise<T>): Promise<T>;
export {};
