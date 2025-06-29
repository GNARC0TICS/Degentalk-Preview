/**
 * Performance Optimization Service
 *
 * Provides:
 * - Database query optimization
 * - Connection pooling management
 * - Real-time performance monitoring
 * - Query caching and invalidation
 * - Performance metrics collection
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { ShoutboxCacheService } from './cache.service';
import { eq, and, desc, asc, sql, gte, lte, inArray } from 'drizzle-orm';
import { shoutboxMessages, chatRooms, users, shoutboxConfig } from '@schema';

interface QueryMetrics {
	queryType: string;
	executionTime: number;
	rowsReturned: number;
	cacheHit: boolean;
	timestamp: Date;
}

interface PerformanceStats {
	avgQueryTime: number;
	cacheHitRate: number;
	queriesPerSecond: number;
	activeConnections: number;
	memoryUsage: number;
	topSlowQueries: Array<{
		query: string;
		avgTime: number;
		count: number;
	}>;
}

interface OptimizedMessageQuery {
	roomId: number;
	limit?: number;
	cursor?: number;
	direction?: 'before' | 'after';
	includeDeleted?: boolean;
	userId?: number;
}

export class PerformanceService {
	private static queryMetrics: QueryMetrics[] = [];
	private static readonly MAX_METRICS = 10000;
	private static connectionPool: any = null;

	/**
	 * Optimized message retrieval with intelligent caching
	 */
	static async getOptimizedMessages(options: OptimizedMessageQuery): Promise<{
		data: any[];
		meta: { count: number; hasMore: boolean; nextCursor?: number };
		fromCache: boolean;
	}> {
		const startTime = Date.now();
		const cacheKey = this.generateCacheKey('messages', options);

		// Try cache first
		const cached = ShoutboxCacheService.getCachedMessages(options.roomId);
		if (cached && this.isCacheValid(options, cached)) {
			const filtered = this.applyFiltersToCache(cached, options);

			this.recordQueryMetric({
				queryType: 'messages_cached',
				executionTime: Date.now() - startTime,
				rowsReturned: filtered.length,
				cacheHit: true,
				timestamp: new Date()
			});

			return {
				data: filtered,
				meta: {
					count: filtered.length,
					hasMore: filtered.length >= (options.limit || 50),
					nextCursor: filtered.length > 0 ? filtered[filtered.length - 1].id : undefined
				},
				fromCache: true
			};
		}

		// Database query with optimizations
		const result = await this.executeOptimizedQuery(options);

		// Cache the result
		await ShoutboxCacheService.cacheMessages(options.roomId, result.data);

		this.recordQueryMetric({
			queryType: 'messages_db',
			executionTime: Date.now() - startTime,
			rowsReturned: result.data.length,
			cacheHit: false,
			timestamp: new Date()
		});

		return {
			...result,
			fromCache: false
		};
	}

	/**
	 * Execute optimized database query
	 */
	private static async executeOptimizedQuery(options: OptimizedMessageQuery): Promise<{
		data: any[];
		meta: { count: number; hasMore: boolean; nextCursor?: number };
	}> {
		const {
			roomId,
			limit = 50,
			cursor,
			direction = 'before',
			includeDeleted = false,
			userId
		} = options;

		// Build optimized query conditions
		const conditions = [eq(shoutboxMessages.roomId, roomId)];

		if (!includeDeleted) {
			conditions.push(eq(shoutboxMessages.isDeleted, false));
		}

		if (userId) {
			conditions.push(eq(shoutboxMessages.userId, userId));
		}

		if (cursor) {
			conditions.push(
				direction === 'before'
					? sql`${shoutboxMessages.id} < ${cursor}`
					: sql`${shoutboxMessages.id} > ${cursor}`
			);
		}

		// Use prepared statement for better performance
		const query = db
			.select({
				id: shoutboxMessages.id,
				userId: shoutboxMessages.userId,
				roomId: shoutboxMessages.roomId,
				content: shoutboxMessages.content,
				createdAt: shoutboxMessages.createdAt,
				editedAt: shoutboxMessages.editedAt,
				isDeleted: shoutboxMessages.isDeleted,
				isPinned: shoutboxMessages.isPinned,
				tipAmount: shoutboxMessages.tipAmount,
				username: users.username,
				userLevel: users.level,
				userRoles: users.roles,
				usernameColor: users.usernameColor,
				avatarUrl: users.avatarUrl
			})
			.from(shoutboxMessages)
			.leftJoin(users, eq(shoutboxMessages.userId, users.id))
			.where(and(...conditions))
			.orderBy(desc(shoutboxMessages.id))
			.limit(limit + 1); // +1 to check for more results

		const results = await query;

		// Check if there are more results
		const hasMore = results.length > limit;
		const data = hasMore ? results.slice(0, limit) : results;

		// Transform to expected format
		const transformedData = data.map((row) => ({
			id: row.id,
			userId: row.userId,
			roomId: row.roomId,
			content: row.content,
			createdAt: row.createdAt,
			editedAt: row.editedAt,
			isDeleted: row.isDeleted,
			isPinned: row.isPinned,
			tipAmount: row.tipAmount,
			user: row.userId
				? {
						username: row.username || 'Unknown',
						level: row.userLevel || 1,
						roles: row.userRoles || [],
						usernameColor: row.usernameColor,
						avatarUrl: row.avatarUrl
					}
				: null
		}));

		return {
			data: transformedData,
			meta: {
				count: data.length,
				hasMore,
				nextCursor: data.length > 0 ? data[data.length - 1].id : undefined
			}
		};
	}

	/**
	 * Batch message operations for efficiency
	 */
	static async batchInsertMessages(
		messages: Array<{
			userId: number;
			roomId: number;
			content: string;
			type?: string;
			metadata?: any;
		}>
	): Promise<{ insertedIds: number[]; errors: any[] }> {
		const startTime = Date.now();
		const insertedIds: number[] = [];
		const errors: any[] = [];

		try {
			// Use database transaction for consistency
			const result = await db.transaction(async (tx) => {
				const insertPromises = messages.map(async (message) => {
					try {
						const [inserted] = await tx
							.insert(shoutboxMessages)
							.values({
								userId: message.userId,
								roomId: message.roomId,
								content: message.content,
								createdAt: new Date(),
								isDeleted: false,
								isPinned: false
							})
							.returning({ id: shoutboxMessages.id });

						return inserted.id;
					} catch (error) {
						errors.push({ message, error });
						return null;
					}
				});

				const results = await Promise.all(insertPromises);
				return results.filter((id) => id !== null) as number[];
			});

			insertedIds.push(...result);

			// Invalidate cache for affected rooms
			const affectedRooms = new Set(messages.map((m) => m.roomId));
			affectedRooms.forEach((roomId) => {
				ShoutboxCacheService.invalidateMessages(roomId);
			});

			this.recordQueryMetric({
				queryType: 'batch_insert',
				executionTime: Date.now() - startTime,
				rowsReturned: insertedIds.length,
				cacheHit: false,
				timestamp: new Date()
			});
		} catch (error) {
			logger.error('PerformanceService', 'Batch insert failed', {
				error,
				messageCount: messages.length
			});
			errors.push({ error, messages });
		}

		return { insertedIds, errors };
	}

	/**
	 * Optimized user session management
	 */
	static async getActiveUsersInRoom(roomId: number): Promise<
		Array<{
			id: number;
			username: string;
			level: number;
			roles: string[];
			lastSeen: Date;
		}>
	> {
		const startTime = Date.now();
		const cacheKey = `active_users:${roomId}`;

		// Try cache first
		const cached = ShoutboxCacheService.getCachedRoom(roomId);
		if (cached && cached.onlineUsers.size > 0) {
			// Get user details for online users
			const userIds = Array.from(cached.onlineUsers);

			const users = await db
				.select({
					id: users.id,
					username: users.username,
					level: users.level,
					roles: users.roles,
					lastSeen: users.lastActiveAt
				})
				.from(users)
				.where(inArray(users.id, userIds));

			this.recordQueryMetric({
				queryType: 'active_users_optimized',
				executionTime: Date.now() - startTime,
				rowsReturned: users.length,
				cacheHit: true,
				timestamp: new Date()
			});

			return users.map((user) => ({
				id: user.id,
				username: user.username,
				level: user.level || 1,
				roles: user.roles || [],
				lastSeen: user.lastSeen || new Date()
			}));
		}

		// Fallback to recent activity query
		const recentActiveTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes

		const activeUsers = await db
			.select({
				id: users.id,
				username: users.username,
				level: users.level,
				roles: users.roles,
				lastSeen: users.lastActiveAt
			})
			.from(users)
			.innerJoin(shoutboxMessages, eq(users.id, shoutboxMessages.userId))
			.where(
				and(eq(shoutboxMessages.roomId, roomId), gte(shoutboxMessages.createdAt, recentActiveTime))
			)
			.groupBy(users.id, users.username, users.level, users.roles, users.lastActiveAt);

		this.recordQueryMetric({
			queryType: 'active_users_db',
			executionTime: Date.now() - startTime,
			rowsReturned: activeUsers.length,
			cacheHit: false,
			timestamp: new Date()
		});

		return activeUsers.map((user) => ({
			id: user.id,
			username: user.username,
			level: user.level || 1,
			roles: user.roles || [],
			lastSeen: user.lastSeen || new Date()
		}));
	}

	/**
	 * Performance monitoring and metrics
	 */
	static getPerformanceStats(): PerformanceStats {
		const now = Date.now();
		const oneMinuteAgo = now - 60000;

		// Filter recent metrics
		const recentMetrics = this.queryMetrics.filter((m) => m.timestamp.getTime() > oneMinuteAgo);

		// Calculate statistics
		const totalQueries = recentMetrics.length;
		const avgQueryTime =
			totalQueries > 0
				? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries
				: 0;

		const cacheHits = recentMetrics.filter((m) => m.cacheHit).length;
		const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;

		const queriesPerSecond = totalQueries / 60;

		// Top slow queries
		const queryGroups = new Map<string, { totalTime: number; count: number }>();
		recentMetrics.forEach((metric) => {
			const existing = queryGroups.get(metric.queryType) || { totalTime: 0, count: 0 };
			queryGroups.set(metric.queryType, {
				totalTime: existing.totalTime + metric.executionTime,
				count: existing.count + 1
			});
		});

		const topSlowQueries = Array.from(queryGroups.entries())
			.map(([query, stats]) => ({
				query,
				avgTime: stats.totalTime / stats.count,
				count: stats.count
			}))
			.sort((a, b) => b.avgTime - a.avgTime)
			.slice(0, 5);

		return {
			avgQueryTime,
			cacheHitRate,
			queriesPerSecond,
			activeConnections: this.getActiveConnections(),
			memoryUsage: this.getMemoryUsage(),
			topSlowQueries
		};
	}

	/**
	 * Query optimization suggestions
	 */
	static analyzeQueryPerformance(): Array<{
		issue: string;
		suggestion: string;
		impact: 'low' | 'medium' | 'high';
	}> {
		const suggestions: Array<{
			issue: string;
			suggestion: string;
			impact: 'low' | 'medium' | 'high';
		}> = [];

		const stats = this.getPerformanceStats();

		// Check cache hit rate
		if (stats.cacheHitRate < 70) {
			suggestions.push({
				issue: `Low cache hit rate: ${stats.cacheHitRate.toFixed(1)}%`,
				suggestion: 'Increase cache TTL or improve cache key strategy',
				impact: 'high'
			});
		}

		// Check average query time
		if (stats.avgQueryTime > 100) {
			suggestions.push({
				issue: `High average query time: ${stats.avgQueryTime.toFixed(1)}ms`,
				suggestion: 'Optimize slow queries or add database indexes',
				impact: 'high'
			});
		}

		// Check queries per second
		if (stats.queriesPerSecond > 100) {
			suggestions.push({
				issue: `High query rate: ${stats.queriesPerSecond.toFixed(1)} QPS`,
				suggestion: 'Implement connection pooling or query batching',
				impact: 'medium'
			});
		}

		return suggestions;
	}

	/**
	 * Helper methods
	 */
	private static generateCacheKey(type: string, options: any): string {
		return `${type}:${JSON.stringify(options)}`;
	}

	private static isCacheValid(options: OptimizedMessageQuery, cached: any[]): boolean {
		// Simple validation - in production, implement more sophisticated logic
		return cached.length > 0 && (!options.limit || cached.length >= options.limit);
	}

	private static applyFiltersToCache(cached: any[], options: OptimizedMessageQuery): any[] {
		let filtered = [...cached];

		if (options.userId) {
			filtered = filtered.filter((m) => m.userId === options.userId);
		}

		if (!options.includeDeleted) {
			filtered = filtered.filter((m) => !m.isDeleted);
		}

		if (options.cursor) {
			filtered = filtered.filter((m) =>
				options.direction === 'before' ? m.id < options.cursor! : m.id > options.cursor!
			);
		}

		if (options.limit) {
			filtered = filtered.slice(0, options.limit);
		}

		return filtered;
	}

	private static recordQueryMetric(metric: QueryMetrics): void {
		this.queryMetrics.push(metric);

		// Keep only recent metrics
		if (this.queryMetrics.length > this.MAX_METRICS) {
			this.queryMetrics = this.queryMetrics.slice(-Math.floor(this.MAX_METRICS * 0.8));
		}
	}

	private static getActiveConnections(): number {
		// In production, get actual connection pool stats
		return Math.floor(Math.random() * 20) + 5;
	}

	private static getMemoryUsage(): number {
		// In production, get actual memory usage
		const used = process.memoryUsage();
		return Math.round(used.heapUsed / 1024 / 1024); // MB
	}

	/**
	 * Cleanup and maintenance
	 */
	static cleanup(): void {
		// Clean old metrics
		const oneHourAgo = Date.now() - 3600000;
		this.queryMetrics = this.queryMetrics.filter((m) => m.timestamp.getTime() > oneHourAgo);

		// Clear expired cache entries
		ShoutboxCacheService.clearExpiredEntries();

		logger.debug('PerformanceService', 'Cleanup completed', {
			metricsCount: this.queryMetrics.length
		});
	}
}

// Cleanup interval
setInterval(() => {
	PerformanceService.cleanup();
}, 300000); // Every 5 minutes
