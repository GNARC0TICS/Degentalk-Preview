/**
 * Repository Interfaces
 *
 * QUALITY IMPROVEMENT: Type-safe interfaces for repository pattern
 * Defines contracts for all domain repositories with proper typing
 */

import type { User, ForumCategory, Thread, Post, Transaction } from '@schema';
import type { PaginatedResult, QueryOptions } from './base-repository';

// Base repository interface
export interface IBaseRepository<T> {
	findById(id: number | string): Promise<T | null>;
	find(options?: QueryOptions): Promise<T[]>;
	findPaginated(options?: QueryOptions): Promise<PaginatedResult<T>>;
	create(data: Partial<T>): Promise<T>;
	update(id: number | string, data: Partial<T>): Promise<T>;
	delete(id: number | string): Promise<void>;
	exists(id: number | string): Promise<boolean>;
	count(filters?: Record<string, any>): Promise<number>;
}

// User Repository Interface
export interface IUserRepository extends IBaseRepository<User> {
	findByUsername(username: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByRole(role: string): Promise<User[]>;
	updateLastLogin(id: number): Promise<void>;
	incrementXP(id: number, amount: number): Promise<User>;
	searchUsers(query: string, limit?: number): Promise<User[]>;
}

// Forum Repository Interface
export interface IForumRepository extends IBaseRepository<ForumCategory> {
	findBySlug(slug: string): Promise<ForumCategory | null>;
	findByType(type: string): Promise<ForumCategory[]>;
	findWithStats(): Promise<ForumCategory[]>;
	getHierarchy(): Promise<ForumCategory[]>;
	updateStats(categoryId: number): Promise<void>;
}

// Thread Repository Interface
export interface IThreadRepository extends IBaseRepository<Thread> {
	findBySlug(slug: string): Promise<Thread | null>;
	findByCategoryId(categoryId: number, options?: QueryOptions): Promise<PaginatedResult<Thread>>;
	findByAuthorId(authorId: number, options?: QueryOptions): Promise<PaginatedResult<Thread>>;
	searchThreads(query: string, options?: QueryOptions): Promise<PaginatedResult<Thread>>;
	incrementViewCount(id: number): Promise<void>;
	updatePostCount(id: number): Promise<void>;
	markAsSolved(id: number, solvingPostId?: number): Promise<Thread>;
}

// Post Repository Interface
export interface IPostRepository extends IBaseRepository<Post> {
	findByThreadId(threadId: number, options?: QueryOptions): Promise<PaginatedResult<Post>>;
	findByAuthorId(authorId: number, options?: QueryOptions): Promise<PaginatedResult<Post>>;
	findReplies(parentPostId: number): Promise<Post[]>;
	incrementLikeCount(id: number): Promise<void>;
	decrementLikeCount(id: number): Promise<void>;
	updateTipCount(id: number, amount: number): Promise<void>;
}

// Transaction Repository Interface
export interface ITransactionRepository extends IBaseRepository<Transaction> {
	findByUserId(userId: number, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
	findByType(type: string, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
	findByStatus(status: string, options?: QueryOptions): Promise<PaginatedResult<Transaction>>;
	getTotalByUser(userId: number, type?: string): Promise<number>;
	getBalanceByUser(userId: number): Promise<number>;
}

// XP Repository Interface (for future implementation)
export interface IXPRepository {
	findByUserId(userId: number): Promise<any>;
	awardXP(userId: number, amount: number, reason: string): Promise<any>;
	getLeaderboard(limit?: number): Promise<any[]>;
	getUserRank(userId: number): Promise<number>;
}

// Repository Factory Interface
export interface IRepositoryFactory {
	getUserRepository(): IUserRepository;
	getForumRepository(): IForumRepository;
	getThreadRepository(): IThreadRepository;
	getPostRepository(): IPostRepository;
	getTransactionRepository(): ITransactionRepository;
	getXPRepository(): IXPRepository;
}

// Repository Context for dependency injection
export interface IRepositoryContext {
	userRepository: IUserRepository;
	forumRepository: IForumRepository;
	threadRepository: IThreadRepository;
	postRepository: IPostRepository;
	transactionRepository: ITransactionRepository;
	xpRepository: IXPRepository;
}

// Transaction context for unit of work pattern
export interface ITransactionContext {
	commit(): Promise<void>;
	rollback(): Promise<void>;
	getUserRepository(): IUserRepository;
	getForumRepository(): IForumRepository;
	getThreadRepository(): IThreadRepository;
	getPostRepository(): IPostRepository;
	getTransactionRepository(): ITransactionRepository;
}

// Repository configuration
export interface RepositoryConfig {
	enableCaching?: boolean;
	cacheTimeout?: number;
	enableQueryLogging?: boolean;
	enablePerformanceMonitoring?: boolean;
	defaultPageSize?: number;
	maxPageSize?: number;
}

// Error handling types
export interface RepositoryErrorContext {
	operation: string;
	entityType: string;
	entityId?: number | string;
	filters?: Record<string, any>;
	originalError?: Error;
}

export type RepositoryErrorCode =
	| 'NOT_FOUND'
	| 'VALIDATION_ERROR'
	| 'DUPLICATE_ERROR'
	| 'FOREIGN_KEY_ERROR'
	| 'CONSTRAINT_ERROR'
	| 'CONNECTION_ERROR'
	| 'TIMEOUT_ERROR'
	| 'UNKNOWN_ERROR';

// Query builder types for complex queries
export interface QueryBuilder<T> {
	where(condition: string, value: any): QueryBuilder<T>;
	whereIn(column: string, values: any[]): QueryBuilder<T>;
	orderBy(column: string, direction?: 'asc' | 'desc'): QueryBuilder<T>;
	limit(count: number): QueryBuilder<T>;
	offset(count: number): QueryBuilder<T>;
	join(table: string, on: string): QueryBuilder<T>;
	leftJoin(table: string, on: string): QueryBuilder<T>;
	groupBy(column: string): QueryBuilder<T>;
	having(condition: string, value: any): QueryBuilder<T>;
	execute(): Promise<T[]>;
	first(): Promise<T | null>;
	count(): Promise<number>;
}

// Cache interface for repository caching
export interface IRepositoryCache {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(pattern?: string): Promise<void>;
	exists(key: string): Promise<boolean>;
}

// Performance monitoring interface
export interface IRepositoryMonitor {
	startQuery(operation: string, entityType: string): void;
	endQuery(operation: string, entityType: string, duration: number): void;
	recordError(operation: string, entityType: string, error: Error): void;
	getStats(): RepositoryStats;
}

export interface RepositoryStats {
	totalQueries: number;
	avgQueryTime: number;
	slowQueries: number;
	errorRate: number;
	mostUsedOperations: Array<{ operation: string; count: number }>;
}
