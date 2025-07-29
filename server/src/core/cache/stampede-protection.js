/**
 * Cache Stampede Protection
 *
 * Prevents multiple concurrent requests from triggering the same expensive operation
 * when cache misses occur. Uses in-memory request deduplication.
 */
import { logger } from '@core/logger';
class StampedeProtection {
    pendingRequests = new Map();
    maxPendingTime = 30000; // 30 seconds max
    cleanupInterval = 60000; // 1 minute cleanup
    cleanupTimer;
    constructor() {
        this.startCleanup();
    }
    /**
     * Execute operation with stampede protection
     * Multiple requests with same key will wait for the first one to complete
     */
    async execute(key, operation) {
        const existing = this.pendingRequests.get(key);
        if (existing) {
            // Check if existing request is still valid (not timed out)
            const age = Date.now() - existing.timestamp;
            if (age < this.maxPendingTime) {
                existing.requestCount++;
                if (process.env.NODE_ENV === 'development') {
                    logger.debug('STAMPEDE_PROTECTION', `Request ${key} deduplicated (${existing.requestCount} total)`);
                }
                try {
                    return await existing.promise;
                }
                catch (error) {
                    // If the existing request failed, remove it and allow retry
                    this.pendingRequests.delete(key);
                    throw error;
                }
            }
            else {
                // Existing request timed out, remove it
                this.pendingRequests.delete(key);
                logger.warn(`Stampede protection: Request ${key} timed out after ${age}ms`);
            }
        }
        // Create new pending request
        const promise = this.executeWithCleanup(key, operation);
        const pendingRequest = {
            promise,
            timestamp: Date.now(),
            requestCount: 1
        };
        this.pendingRequests.set(key, pendingRequest);
        return await promise;
    }
    /**
     * Execute operation and clean up after completion
     */
    async executeWithCleanup(key, operation) {
        try {
            const result = await operation();
            // Clean up successful request
            const pending = this.pendingRequests.get(key);
            if (pending && pending.requestCount > 1) {
                logger.debug(`Stampede protection: Request ${key} served ${pending.requestCount} callers`);
            }
            this.pendingRequests.delete(key);
            return result;
        }
        catch (error) {
            // Clean up failed request
            this.pendingRequests.delete(key);
            throw error;
        }
    }
    /**
     * Get current pending request count for monitoring
     */
    getPendingCount() {
        return this.pendingRequests.size;
    }
    /**
     * Get pending requests info for debugging
     */
    getPendingRequests() {
        const now = Date.now();
        return Array.from(this.pendingRequests.entries()).map(([key, request]) => ({
            key,
            age: now - request.timestamp,
            requestCount: request.requestCount
        }));
    }
    /**
     * Clear all pending requests (for testing)
     */
    clear() {
        this.pendingRequests.clear();
    }
    /**
     * Start periodic cleanup of timed out requests
     */
    startCleanup() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }
    /**
     * Clean up timed out pending requests
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, request] of this.pendingRequests) {
            const age = now - request.timestamp;
            if (age > this.maxPendingTime) {
                keysToDelete.push(key);
            }
        }
        if (keysToDelete.length > 0) {
            keysToDelete.forEach(key => this.pendingRequests.delete(key));
            logger.warn(`Stampede protection: Cleaned up ${keysToDelete.length} timed out requests`);
        }
    }
    /**
     * Stop cleanup timer (for graceful shutdown)
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.pendingRequests.clear();
    }
}
// Export singleton instance
export const stampedeProtection = new StampedeProtection();
/**
 * Decorator to add stampede protection to methods
 * Use this on expensive operations that might be called concurrently
 */
export function ProtectStampede(keyPrefix) {
    return function (target, propertyName, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        descriptor.value = async function (...args) {
            // Generate unique key based on class, method, and arguments
            const baseKey = keyPrefix || `${className}.${propertyName}`;
            const argsKey = args.length > 0 ?
                JSON.stringify(args).slice(0, 100) : // Limit key length
                'no-args';
            const stampedeKey = `stampede:${baseKey}:${argsKey}`;
            return await stampedeProtection.execute(stampedeKey, () => {
                return originalMethod.apply(this, args);
            });
        };
        return descriptor;
    };
}
/**
 * Manual stampede protection for functional code
 */
export async function withStampedeProtection(key, operation) {
    return await stampedeProtection.execute(key, operation);
}
