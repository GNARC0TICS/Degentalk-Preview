/**
 * Repository Factory
 *
 * QUALITY IMPROVEMENT: Centralized repository management with dependency injection
 * Provides singleton instances of all repositories with proper initialization
 */

import type {
	IRepositoryFactory,
	IUserRepository,
	IForumRepository,
	IThreadRepository,
	IPostRepository,
	ITransactionRepository,
	IXPRepository,
	RepositoryConfig
} from './interfaces';

import { UserRepository } from './repositories/user-repository';
import { TransactionRepository } from './repositories/transaction-repository';
import { ThreadRepository } from './repositories/thread-repository';
import { logger } from '../logger';

// Default configuration
const DEFAULT_CONFIG: RepositoryConfig = {
	enableCaching: false,
	cacheTimeout: 300, // 5 minutes
	enableQueryLogging: process.env.NODE_ENV === 'development',
	enablePerformanceMonitoring: true,
	defaultPageSize: 20,
	maxPageSize: 100
};

export class RepositoryFactory implements IRepositoryFactory {
	private config: RepositoryConfig;
	private instances: Map<string, any> = new Map();

	constructor(config: Partial<RepositoryConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		logger.info('RepositoryFactory', 'Initialized with config', { config: this.config });
	}

	/**
	 * Get User Repository instance
	 */
	getUserRepository(): IUserRepository {
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
	getTransactionRepository(): ITransactionRepository {
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
	getForumRepository(): IForumRepository {
		if (!this.instances.has('forumRepository')) {
			// For now, throw an error as it's not implemented yet
			throw new Error('ForumRepository not yet implemented');
		}
		return this.instances.get('forumRepository');
	}

	/**
	 * Get Thread Repository instance
	 */
	getThreadRepository(): IThreadRepository {
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
	getPostRepository(): IPostRepository {
		if (!this.instances.has('postRepository')) {
			// For now, throw an error as it's not implemented yet
			throw new Error('PostRepository not yet implemented');
		}
		return this.instances.get('postRepository');
	}

	/**
	 * Get XP Repository instance (placeholder for future implementation)
	 */
	getXPRepository(): IXPRepository {
		if (!this.instances.has('xpRepository')) {
			// For now, throw an error as it's not implemented yet
			throw new Error('XPRepository not yet implemented');
		}
		return this.instances.get('xpRepository');
	}

	/**
	 * Clear all repository instances (useful for testing)
	 */
	clearInstances(): void {
		this.instances.clear();
		logger.debug('RepositoryFactory', 'Cleared all repository instances');
	}

	/**
	 * Get current configuration
	 */
	getConfig(): RepositoryConfig {
		return { ...this.config };
	}

	/**
	 * Update configuration
	 */
	updateConfig(newConfig: Partial<RepositoryConfig>): void {
		this.config = { ...this.config, ...newConfig };
		logger.info('RepositoryFactory', 'Updated configuration', { config: this.config });
	}

	/**
	 * Health check for all repositories
	 */
	async healthCheck(): Promise<{
		status: 'healthy' | 'unhealthy';
		repositories: Record<string, boolean>;
		timestamp: string;
	}> {
		const results: Record<string, boolean> = {};
		let allHealthy = true;

		try {
			// Test User Repository
			const userRepo = this.getUserRepository();
			const userCount = await userRepo.count();
			results.userRepository = typeof userCount === 'number';
		} catch (error) {
			results.userRepository = false;
			allHealthy = false;
		}

		try {
			// Test Transaction Repository
			const transactionRepo = this.getTransactionRepository();
			const transactionCount = await transactionRepo.count();
			results.transactionRepository = typeof transactionCount === 'number';
		} catch (error) {
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
	getUsageStats(): {
		instanceCount: number;
		instances: string[];
		config: RepositoryConfig;
	} {
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
