/**
 * Repository Factory
 *
 * QUALITY IMPROVEMENT: Centralized repository management with dependency injection
 * Provides singleton instances of all repositories with proper initialization
 */
import { UserRepository } from './repositories/user-repository';
import { TransactionRepository } from './repositories/transaction-repository';
import { ThreadRepository } from './repositories/thread-repository';
import { logger } from '../logger';
// Default configuration
const DEFAULT_CONFIG = {
    enableCaching: false,
    cacheTimeout: 300, // 5 minutes
    enableQueryLogging: process.env.NODE_ENV === 'development',
    enablePerformanceMonitoring: true,
    defaultPageSize: 20,
    maxPageSize: 100
};
export class RepositoryFactory {
    config;
    instances = new Map();
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        logger.info('RepositoryFactory', 'Initialized with config', { config: this.config });
    }
    /**
     * Get User Repository instance
     */
    getUserRepository() {
        if (!this.instances.has('userRepository')) {
            const repository = new UserRepository();
            this.instances.set('userRepository', repository);
            logger.debug('RepositoryFactory', 'Created UserRepository instance');
        }
        return this.instances.get('userRepository');
    }
    /**
     * Get Transaction Repository instance
     */
    getTransactionRepository() {
        if (!this.instances.has('transactionRepository')) {
            const repository = new TransactionRepository();
            this.instances.set('transactionRepository', repository);
            logger.debug('RepositoryFactory', 'Created TransactionRepository instance');
        }
        return this.instances.get('transactionRepository');
    }
    /**
     * Get Forum Repository instance (placeholder for future implementation)
     */
    getForumRepository() {
        if (!this.instances.has('forumRepository')) {
            // For now, throw an error as it's not implemented yet
            throw new Error('ForumRepository not yet implemented');
        }
        return this.instances.get('forumRepository');
    }
    /**
     * Get Thread Repository instance
     */
    getThreadRepository() {
        if (!this.instances.has('threadRepository')) {
            const repository = new ThreadRepository();
            this.instances.set('threadRepository', repository);
            logger.debug('RepositoryFactory', 'Created ThreadRepository instance');
        }
        return this.instances.get('threadRepository');
    }
    /**
     * Get Post Repository instance (placeholder for future implementation)
     */
    getPostRepository() {
        if (!this.instances.has('postRepository')) {
            // For now, throw an error as it's not implemented yet
            throw new Error('PostRepository not yet implemented');
        }
        return this.instances.get('postRepository');
    }
    /**
     * Get XP Repository instance (placeholder for future implementation)
     */
    getXPRepository() {
        if (!this.instances.has('xpRepository')) {
            // For now, throw an error as it's not implemented yet
            throw new Error('XPRepository not yet implemented');
        }
        return this.instances.get('xpRepository');
    }
    /**
     * Clear all repository instances (useful for testing)
     */
    clearInstances() {
        this.instances.clear();
        logger.debug('RepositoryFactory', 'Cleared all repository instances');
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger.info('RepositoryFactory', 'Updated configuration', { config: this.config });
    }
    /**
     * Health check for all repositories
     */
    async healthCheck() {
        const results = {};
        let allHealthy = true;
        try {
            // Test User Repository
            const userRepo = this.getUserRepository();
            const userCount = await userRepo.count();
            results.userRepository = typeof userCount === 'number';
        }
        catch (error) {
            results.userRepository = false;
            allHealthy = false;
        }
        try {
            // Test Transaction Repository
            const transactionRepo = this.getTransactionRepository();
            const transactionCount = await transactionRepo.count();
            results.transactionRepository = typeof transactionCount === 'number';
        }
        catch (error) {
            results.transactionRepository = false;
            allHealthy = false;
        }
        // Add placeholders for other repositories
        results.forumRepository = false; // Not implemented yet
        results.threadRepository = false; // Not implemented yet
        results.postRepository = false; // Not implemented yet
        results.xpRepository = false; // Not implemented yet
        return {
            status: allHealthy ? 'healthy' : 'unhealthy',
            repositories: results,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Get repository usage statistics
     */
    getUsageStats() {
        return {
            instanceCount: this.instances.size,
            instances: Array.from(this.instances.keys()),
            config: this.getConfig()
        };
    }
}
// Export singleton instance
export const repositoryFactory = new RepositoryFactory();
// Export convenience functions for direct access
export const getUserRepository = () => repositoryFactory.getUserRepository();
export const getTransactionRepository = () => repositoryFactory.getTransactionRepository();
// For future repositories
export const getForumRepository = () => repositoryFactory.getForumRepository();
export const getThreadRepository = () => repositoryFactory.getThreadRepository();
export const getPostRepository = () => repositoryFactory.getPostRepository();
export const getXPRepository = () => repositoryFactory.getXPRepository();
