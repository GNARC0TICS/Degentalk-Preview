/**
 * Repository Module Exports
 *
 * QUALITY IMPROVEMENT: Central export point for repository pattern implementation
 * Provides easy access to all repository classes, interfaces, and utilities
 */

// Base repository and utilities
export { BaseRepository, RepositoryError } from './base-repository';
export type {
	PaginationOptions,
	SortOptions,
	FilterOptions,
	QueryOptions,
	PaginatedResult,
	RepositoryTransaction
} from './base-repository';

// Repository interfaces
export type {
	IBaseRepository,
	IUserRepository,
	IForumRepository,
	IThreadRepository,
	IPostRepository,
	ITransactionRepository,
	IXPRepository,
	IRepositoryFactory,
	IRepositoryContext,
	ITransactionContext,
	RepositoryConfig,
	RepositoryErrorContext,
	RepositoryErrorCode,
	QueryBuilder,
	IRepositoryCache,
	IRepositoryMonitor,
	RepositoryStats
} from './interfaces';

// Repository implementations
export { UserRepository } from './repositories/user-repository';
export { TransactionRepository } from './repositories/transaction-repository';

// Repository factory and utilities
export {
	RepositoryFactory,
	repositoryFactory,
	getUserRepository,
	getTransactionRepository,
	getForumRepository,
	getThreadRepository,
	getPostRepository,
	getXPRepository
} from './repository-factory';

// Version information
export const REPOSITORY_VERSION = '1.0.0';
export const REPOSITORY_BUILD_DATE = new Date().toISOString();

// Repository module status
export const REPOSITORY_STATUS = {
	implemented: ['UserRepository', 'TransactionRepository'],
	planned: ['ForumRepository', 'ThreadRepository', 'PostRepository', 'XPRepository'],
	features: [
		'Type-safe interfaces',
		'Error handling',
		'Pagination support',
		'Query building',
		'Validation',
		'Logging integration'
	]
};

// Utility functions
export const createRepositoryFactory = (config?: Partial<RepositoryConfig>) => {
	return new RepositoryFactory(config);
};

export const isRepositoryError = (error: any): error is RepositoryError => {
	return error instanceof RepositoryError;
};
