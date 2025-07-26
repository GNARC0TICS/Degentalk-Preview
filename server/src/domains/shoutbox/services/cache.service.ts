/**
 * Shoutbox Cache Service - Unified Cache Wrapper
 *
 * Maintains the existing ShoutboxCacheService API while using the unified cache service internally.
 * This allows gradual migration without breaking existing code.
 */

import { cacheService, CacheCategory } from '@core/cache/unified-cache.service';
import { logger } from '@core/logger';
import { createHash } from 'crypto';
import type { RoomId, MessageId, UserId, EntityId } from '@shared/types/ids';

interface CacheItem<T> {
	data: T;
	expiry: number;
	version: string;
}

interface MessageCacheEntry {
	id: MessageId;
	userId: UserId | null;
	roomId: RoomId;
	content: string;
	createdAt: Date;
	isPinned: boolean;
	isDeleted: boolean;
	user?: {
		username: string;
		level: number;
		roles?: string[];
		usernameColor?: string;
	};
}

interface UserSessionCache {
	userId: UserId;
	username: string;
	roles: string[];
	level: number;
	permissions: Record<string, boolean>;
	lastSeen: Date;
	rateLimitState: {
		messageCount: number;
		resetTime: number;
		cooldownUntil?: number;
	};
}

interface RoomCache {
	id: EntityId;
	name: string;
	config: any;
	accessibleUsers: Set<UserId>;
	onlineUsers: Set<UserId>;
	pinnedMessages: number[];
}

export class ShoutboxCacheService {
	// Keep static methods for backward compatibility
	private static readonly DEFAULT_TTL = 5 * 60; // 5 minutes in seconds
	private static readonly MESSAGE_CACHE_SIZE = 500;
	private static readonly USER_SESSION_TTL = 30 * 60; // 30 minutes in seconds
	private static readonly ROOM_CONFIG_TTL = 60 * 60; // 1 hour in seconds
	private static readonly TYPING_TTL = 10; // 10 seconds for typing indicators

	/**
	 * Generate version hash for cache invalidation
	 */
	private static generateVersion(): string {
		return createHash('md5').update(Date.now().toString()).digest('hex').substring(0, 8);
	}

	/**
	 * Message caching with LRU eviction
	 */
	static async cacheMessages(roomId: RoomId, messages: MessageCacheEntry[]): Promise<void> {
		const key = `messages:${roomId}`;
		
		// Store messages
		await cacheService.set(key, messages, {
			category: CacheCategory.SHOUTBOX,
			ttl: this.DEFAULT_TTL
		});

		// Track message IDs for invalidation
		const messageIds = messages.map((m) => m.id);
		await cacheService.set(`message_ids:${roomId}`, messageIds, {
			category: CacheCategory.SHOUTBOX,
			ttl: this.DEFAULT_TTL
		});

		logger.debug('ShoutboxCacheService', 'Cached messages', { roomId, count: messages.length });
	}

	static async getCachedMessages(roomId: RoomId): Promise<MessageCacheEntry[] | null> {
		const key = `messages:${roomId}`;
		const cached = await cacheService.get<MessageCacheEntry[]>(key, {
			category: CacheCategory.SHOUTBOX
		});

		if (cached) {
			logger.debug('ShoutboxCacheService', 'Cache hit for messages', {
				roomId,
				count: cached.length
			});
		}

		return cached;
	}

	static async invalidateMessages(roomId: RoomId, messageId?: MessageId): Promise<void> {
		if (messageId) {
			// Invalidate specific message
			await cacheService.delete(`message:${messageId}`, {
				category: CacheCategory.SHOUTBOX
			});
		}

		// Always invalidate room messages
		await cacheService.delete(`messages:${roomId}`, {
			category: CacheCategory.SHOUTBOX
		});
		await cacheService.delete(`message_ids:${roomId}`, {
			category: CacheCategory.SHOUTBOX
		});

		logger.debug('ShoutboxCacheService', 'Invalidated messages cache', { roomId, messageId });
	}

	/**
	 * User session caching
	 */
	static async cacheUserSession(userId: UserId, session: UserSessionCache): Promise<void> {
		const key = `user_session:${userId}`;
		await cacheService.set(key, session, {
			category: CacheCategory.SESSION,
			ttl: this.USER_SESSION_TTL
		});
	}

	static async getCachedUserSession(userId: UserId): Promise<UserSessionCache | null> {
		const key = `user_session:${userId}`;
		return await cacheService.get<UserSessionCache>(key, {
			category: CacheCategory.SESSION
		});
	}

	static async invalidateUserSession(userId: UserId): Promise<void> {
		const key = `user_session:${userId}`;
		await cacheService.delete(key, {
			category: CacheCategory.SESSION
		});
	}

	/**
	 * Room configuration caching
	 */
	static async cacheRoom(roomId: RoomId, room: RoomCache): Promise<void> {
		const key = `room:${roomId}`;
		await cacheService.set(key, room, {
			category: CacheCategory.SHOUTBOX,
			ttl: this.ROOM_CONFIG_TTL
		});
	}

	static async getCachedRoom(roomId: RoomId): Promise<RoomCache | null> {
		const key = `room:${roomId}`;
		return await cacheService.get<RoomCache>(key, {
			category: CacheCategory.SHOUTBOX
		});
	}

	static async invalidateRoomConfig(roomId: RoomId): Promise<void> {
		await cacheService.delete(`room:${roomId}`, {
			category: CacheCategory.SHOUTBOX
		});
		logger.debug('ShoutboxCacheService', 'Invalidated room config', { roomId });
	}

	/**
	 * Rate limiting state
	 */
	static async cacheRateLimitState(userId: UserId, state: any): Promise<void> {
		const key = `rate_limit:${userId}`;
		await cacheService.set(key, state, {
			category: CacheCategory.RATE_LIMIT,
			ttl: 60 // 1 minute
		});
	}

	static async getRateLimitState(userId: UserId): Promise<any | null> {
		const key = `rate_limit:${userId}`;
		return await cacheService.get(key, {
			category: CacheCategory.RATE_LIMIT
		});
	}

	/**
	 * Typing indicators
	 */
	static async setTypingIndicator(roomId: RoomId, userId: UserId): Promise<void> {
		const key = `typing:${roomId}:${userId}`;
		await cacheService.set(key, true, {
			category: CacheCategory.REALTIME,
			ttl: this.TYPING_TTL
		});
	}

	static async getTypingUsers(roomId: RoomId): Promise<UserId[]> {
		// This would need pattern matching support in unified cache
		// For now, return empty array
		return [];
	}

	/**
	 * Cache statistics
	 */
	static async getCacheStats(): Promise<any> {
		const metrics = cacheService.getMetrics();
		
		// Transform to match existing API
		return {
			messages: {
				size: metrics.categories[CacheCategory.SHOUTBOX]?.size || 0,
				hits: metrics.categories[CacheCategory.SHOUTBOX]?.hits || 0,
				misses: metrics.categories[CacheCategory.SHOUTBOX]?.misses || 0
			},
			sessions: {
				size: metrics.categories[CacheCategory.SESSION]?.size || 0,
				hits: metrics.categories[CacheCategory.SESSION]?.hits || 0,
				misses: metrics.categories[CacheCategory.SESSION]?.misses || 0
			},
			rooms: {
				size: metrics.categories[CacheCategory.SHOUTBOX]?.size || 0,
				hits: metrics.categories[CacheCategory.SHOUTBOX]?.hits || 0,
				misses: metrics.categories[CacheCategory.SHOUTBOX]?.misses || 0
			},
			overall: {
				hitRate: metrics.hitRate,
				totalHits: metrics.hits,
				totalMisses: metrics.misses,
				totalErrors: metrics.errors,
				memoryUsage: metrics.memoryUsage
			}
		};
	}

	/**
	 * Clear all shoutbox-related caches
	 */
	static async clearAll(): Promise<void> {
		await cacheService.clear(CacheCategory.SHOUTBOX);
		await cacheService.deletePattern('typing:', CacheCategory.REALTIME);
		logger.info('ShoutboxCacheService', 'Cleared all shoutbox caches');
	}

	/**
	 * Clear expired entries (called by cleanup interval)
	 */
	static async clearExpiredEntries(): Promise<void> {
		// Unified cache handles expiration automatically
		// This is now a no-op for backward compatibility
		logger.debug('ShoutboxCacheService', 'Expired entries cleared by unified cache');
	}

	/**
	 * Warmup cache with critical data
	 */
	static async warmupCache(data: {
		rooms?: RoomCache[];
		messages?: { roomId: RoomId; messages: MessageCacheEntry[] }[];
	}): Promise<void> {
		const warmupData = [];

		if (data.rooms) {
			for (const room of data.rooms) {
				warmupData.push({
					key: `room:${room.id}`,
					value: room,
					options: {
						category: CacheCategory.SHOUTBOX,
						ttl: this.ROOM_CONFIG_TTL
					}
				});
			}
		}

		if (data.messages) {
			for (const { roomId, messages } of data.messages) {
				warmupData.push({
					key: `messages:${roomId}`,
					value: messages,
					options: {
						category: CacheCategory.SHOUTBOX,
						ttl: this.DEFAULT_TTL
					}
				});
			}
		}

		await cacheService.warmup(warmupData);
		logger.info('ShoutboxCacheService', 'Cache warmup completed', {
			rooms: data.rooms?.length || 0,
			messageGroups: data.messages?.length || 0
		});
	}
}

// Helper methods for migration
export const shoutboxCacheService = ShoutboxCacheService;