import type { UserId } from '@db/types';
/**
 * Shoutbox Cache Service
 *
 * High-performance caching layer for:
 * - Recent messages with real-time invalidation
 * - User session data and permissions
 * - Room configurations and access controls
 * - Rate limiting state
 * - Typing indicators
 */

import { logger } from '@server/src/core/logger';
import { createHash } from 'crypto';
import type { RoomId, MessageId } from '@/db/types';

interface CacheItem<T> {
	data: T;
	expiry: number;
	version: string;
}

interface MessageCacheEntry {
	id: number;
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
	id: number;
	name: string;
	config: any;
	accessibleUsers: Set<UserId>;
	onlineUsers: Set<UserId>;
	pinnedMessages: number[];
}

export class ShoutboxCacheService {
	private static cache = new Map<string, CacheItem<any>>();
	private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
	private static readonly MESSAGE_CACHE_SIZE = 500;
	private static readonly USER_SESSION_TTL = 30 * 60 * 1000; // 30 minutes
	private static readonly ROOM_CONFIG_TTL = 60 * 60 * 1000; // 1 hour

	/**
	 * Message caching with LRU eviction
	 */
	static async cacheMessages(roomId: RoomId, messages: MessageCacheEntry[]): Promise<void> {
		const key = `messages:${roomId}`;
		const version = this.generateVersion();

		this.setCache(key, messages, this.DEFAULT_TTL, version);

		// Track message IDs for invalidation
		const messageIds = messages.map((m) => m.id);
		this.setCache(`message_ids:${roomId}`, messageIds, this.DEFAULT_TTL, version);

		logger.debug('ShoutboxCacheService', 'Cached messages', { roomId, count: messages.length });
	}

	static getCachedMessages(roomId: RoomId): MessageCacheEntry[] | null {
		const key = `messages:${roomId}`;
		const cached = this.getCache<MessageCacheEntry[]>(key);

		if (cached) {
			logger.debug('ShoutboxCacheService', 'Cache hit for messages', {
				roomId,
				count: cached.length
			});
		}

		return cached;
	}

	static invalidateMessages(roomId: RoomId, messageId?: MessageId): void {
		const key = `messages:${roomId}`;

		if (messageId) {
			// Partial invalidation - remove specific message
			const cached = this.getCache<MessageCacheEntry[]>(key);
			if (cached) {
				const filtered = cached.filter((m) => m.id !== messageId);
				const version = this.generateVersion();
				this.setCache(key, filtered, this.DEFAULT_TTL, version);
				logger.debug('ShoutboxCacheService', 'Invalidated specific message', { roomId, messageId });
				return;
			}
		}

		// Full invalidation
		this.deleteCache(key);
		this.deleteCache(`message_ids:${roomId}`);
		logger.debug('ShoutboxCacheService', 'Invalidated all messages', { roomId });
	}

	/**
	 * User session caching
	 */
	static cacheUserSession(userId: UserId, session: UserSessionCache): void {
		const key = `user_session:${userId}`;
		const version = this.generateVersion();

		this.setCache(key, session, this.USER_SESSION_TTL, version);
		logger.debug('ShoutboxCacheService', 'Cached user session', { userId });
	}

	static getCachedUserSession(userId: UserId): UserSessionCache | null {
		const key = `user_session:${userId}`;
		return this.getCache<UserSessionCache>(key);
	}

	static updateUserLastSeen(userId: UserId): void {
		const key = `user_session:${userId}`;
		const cached = this.getCache<UserSessionCache>(key);

		if (cached) {
			cached.lastSeen = new Date();
			const version = this.generateVersion();
			this.setCache(key, cached, this.USER_SESSION_TTL, version);
		}
	}

	static invalidateUserSession(userId: UserId): void {
		const key = `user_session:${userId}`;
		this.deleteCache(key);
		logger.debug('ShoutboxCacheService', 'Invalidated user session', { userId });
	}

	/**
	 * Rate limiting cache
	 */
	static getRateLimitState(
		userId: UserId
	): { messageCount: number; resetTime: number; cooldownUntil?: number } | null {
		const session = this.getCachedUserSession(userId);
		return session?.rateLimitState || null;
	}

	static updateRateLimitState(
		userId: UserId,
		state: { messageCount: number; resetTime: number; cooldownUntil?: number }
	): void {
		const key = `user_session:${userId}`;
		const cached = this.getCache<UserSessionCache>(key);

		if (cached) {
			cached.rateLimitState = state;
			const version = this.generateVersion();
			this.setCache(key, cached, this.USER_SESSION_TTL, version);
		}
	}

	/**
	 * Room configuration caching
	 */
	static cacheRoomConfig(roomId: RoomId, config: any): void {
		const key = `room_config:${roomId}`;
		const version = this.generateVersion();

		this.setCache(key, config, this.ROOM_CONFIG_TTL, version);
		logger.debug('ShoutboxCacheService', 'Cached room config', { roomId });
	}

	static getCachedRoomConfig(roomId: RoomId): any | null {
		const key = `room_config:${roomId}`;
		return this.getCache(key);
	}

	static invalidateRoomConfig(roomId?: RoomId): void {
		if (roomId) {
			const key = `room_config:${roomId}`;
			this.deleteCache(key);
			logger.debug('ShoutboxCacheService', 'Invalidated room config', { roomId });
		} else {
			// Invalidate all room configs
			const keys = Array.from(this.cache.keys()).filter((k) => k.startsWith('room_config:'));
			keys.forEach((key) => this.deleteCache(key));
			logger.debug('ShoutboxCacheService', 'Invalidated all room configs');
		}
	}

	/**
	 * Room access and online users
	 */
	static cacheRoom(room: RoomCache): void {
		const key = `room:${room.id}`;
		const version = this.generateVersion();

		this.setCache(key, room, this.DEFAULT_TTL, version);
		logger.debug('ShoutboxCacheService', 'Cached room data', { roomId: room.id });
	}

	static getCachedRoom(roomId: RoomId): RoomCache | null {
		const key = `room:${roomId}`;
		return this.getCache<RoomCache>(key);
	}

	static addUserToRoom(roomId: RoomId, userId: UserId): void {
		const key = `room:${roomId}`;
		const cached = this.getCache<RoomCache>(key);

		if (cached) {
			cached.onlineUsers.add(userId);
			const version = this.generateVersion();
			this.setCache(key, cached, this.DEFAULT_TTL, version);
		}
	}

	static removeUserFromRoom(roomId: RoomId, userId: UserId): void {
		const key = `room:${roomId}`;
		const cached = this.getCache<RoomCache>(key);

		if (cached) {
			cached.onlineUsers.delete(userId);
			const version = this.generateVersion();
			this.setCache(key, cached, this.DEFAULT_TTL, version);
		}
	}

	/**
	 * Typing indicators
	 */
	static setTypingIndicator(roomId: RoomId, userId: UserId, username: string): void {
		const key = `typing:${roomId}`;
		const cached =
			this.getCache<Map<UserId, { username: string; timestamp: number }>>(key) || new Map();

		cached.set(userId, { username, timestamp: Date.now() });
		const version = this.generateVersion();
		this.setCache(key, cached, 10000, version); // 10 seconds

		// Clean up expired typing indicators
		this.cleanupTypingIndicators(roomId);
	}

	static removeTypingIndicator(roomId: RoomId, userId: UserId): void {
		const key = `typing:${roomId}`;
		const cached = this.getCache<Map<UserId, { username: string; timestamp: number }>>(key);

		if (cached) {
			cached.delete(userId);
			const version = this.generateVersion();
			this.setCache(key, cached, 10000, version);
		}
	}

	static getTypingIndicators(roomId: RoomId): string[] {
		const key = `typing:${roomId}`;
		const cached = this.getCache<Map<UserId, { username: string; timestamp: number }>>(key);

		if (!cached) return [];

		// Clean up expired indicators
		this.cleanupTypingIndicators(roomId);

		// Return active usernames
		return Array.from(cached.values()).map((t) => t.username);
	}

	private static cleanupTypingIndicators(roomId: RoomId): void {
		const key = `typing:${roomId}`;
		const cached = this.getCache<Map<UserId, { username: string; timestamp: number }>>(key);

		if (cached) {
			const now = Date.now();
			const expired = Array.from(cached.entries()).filter(
				([_, data]) => now - data.timestamp > 5000
			);

			if (expired.length > 0) {
				expired.forEach(([userId]) => cached.delete(userId));
				const version = this.generateVersion();
				this.setCache(key, cached, 10000, version);
			}
		}
	}

	/**
	 * Performance monitoring
	 */
	static getCacheStats(): {
		size: number;
		hitRate: number;
		memoryUsage: string;
		topKeys: string[];
	} {
		const size = this.cache.size;
		const memoryUsage = this.estimateMemoryUsage();

		// Get most accessed keys (would need hit tracking in production)
		const topKeys = Array.from(this.cache.keys()).slice(0, 10);

		return {
			size,
			hitRate: 0, // Would need hit/miss tracking
			memoryUsage,
			topKeys
		};
	}

	static clearExpiredEntries(): number {
		const now = Date.now();
		const expired = Array.from(this.cache.entries())
			.filter(([_, item]) => item.expiry < now)
			.map(([key]) => key);

		expired.forEach((key) => this.cache.delete(key));

		if (expired.length > 0) {
			logger.debug('ShoutboxCacheService', 'Cleared expired entries', { count: expired.length });
		}

		return expired.length;
	}

	static clearAll(): void {
		this.cache.clear();
		logger.info('ShoutboxCacheService', 'Cleared all cache entries');
	}

	/**
	 * Core cache operations
	 */
	private static setCache<T>(key: string, data: T, ttl: number, version: string): void {
		const expiry = Date.now() + ttl;
		this.cache.set(key, { data, expiry, version });

		// LRU eviction if cache gets too large
		if (this.cache.size > 10000) {
			this.evictLRU();
		}
	}

	private static getCache<T>(key: string): T | null {
		const item = this.cache.get(key);

		if (!item) return null;

		if (Date.now() > item.expiry) {
			this.cache.delete(key);
			return null;
		}

		return item.data as T;
	}

	private static deleteCache(key: string): void {
		this.cache.delete(key);
	}

	private static generateVersion(): string {
		return createHash('md5').update(Date.now().toString()).digest('hex').substring(0, 8);
	}

	private static evictLRU(): void {
		// Simple eviction - remove oldest entries
		const entries = Array.from(this.cache.entries());
		const toRemove = entries.sort((a, b) => a[1].expiry - b[1].expiry).slice(0, 1000);

		toRemove.forEach(([key]) => this.cache.delete(key));

		logger.debug('ShoutboxCacheService', 'Evicted LRU entries', { count: toRemove.length });
	}

	private static estimateMemoryUsage(): string {
		const approxSize = JSON.stringify(Array.from(this.cache.entries())).length;
		const mb = approxSize / (1024 * 1024);
		return `${mb.toFixed(2)} MB`;
	}
}

// Cleanup interval
setInterval(() => {
	ShoutboxCacheService.clearExpiredEntries();
}, 60000); // Every minute
