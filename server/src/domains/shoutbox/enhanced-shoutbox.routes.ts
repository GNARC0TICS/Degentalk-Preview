import { userService } from '@server/src/core/services/user.service';
/**
 * Enhanced Shoutbox Routes
 *
 * Complete implementation with:
 * - Command processing (/tip, /rain, /airdrop, moderation)
 * - Admin configuration management
 * - User ignore system
 * - Enhanced message filtering and caching
 * - Analytics tracking
 * - Room management
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { MessageId, RoomId, UserId } from '@shared/types';
import { db } from '@db';
import {
	shoutboxMessages,
	shoutboxConfig,
	shoutboxUserIgnores,
	shoutboxAnalytics,
	chatRooms,
	users
} from '@schema';
import { sql, desc, eq, and, isNull, inArray, asc, not, or, gt } from 'drizzle-orm';
import { z } from 'zod';
import {
	isAuthenticated,
	isAuthenticatedOptional,
	isAdminOrModerator,
	isAdmin
} from '../auth/middleware/auth.middleware';
import { getUserId } from '../auth/services/auth.service';
import { logger } from '@server/src/core/logger';
import { ShoutboxService } from './services/shoutbox.service';
import { RoomService } from './services/room.service';
import { MessageHistoryService } from './services/history.service';
import { ShoutboxCacheService } from './services/cache.service';
import { messageQueue, MessageQueueService } from './services/queue.service';
import { PerformanceService } from './services/performance.service';
import { createCustomRateLimiter } from '@server/src/core/services/rate-limit.service';
import { isValidId } from '@shared/utils/id';

const router = Router();

// Enhanced rate limiting for different user types
const userRateLimiters = {
	// VIP users get reduced cooldown
	vip: createCustomRateLimiter({
		windowMs: 5 * 1000, // 5 seconds
		max: 1,
		message: { error: 'Please wait 5 seconds between messages (VIP)' }
	}),

	// Regular users
	regular: createCustomRateLimiter({
		windowMs: 10 * 1000, // 10 seconds
		max: 1,
		message: { error: 'Please wait 10 seconds between messages' }
	}),

	// New users (level < 5) get longer cooldown
	newUser: createCustomRateLimiter({
		windowMs: 15 * 1000, // 15 seconds
		max: 1,
		message: { error: 'Please wait 15 seconds between messages (new user)' }
	})
};

// Message validation schema
const messageSchema = z.object({
	content: z.string().min(1).max(500),
	roomId: z.string().uuid().optional(),
	replyTo: z.string().uuid().optional(),
	mentions: z.array(z.string()).optional()
});

// Room creation schema
const createRoomSchema = z.object({
	name: z.string().min(3).max(50),
	description: z.string().max(200).optional(),
	isPrivate: z.boolean().default(false),
	minXpRequired: z.number().min(0).optional(),
	minGroupIdRequired: z.number().min(1).optional(),
	accessRoles: z.array(z.string()).optional(),
	themeConfig: z.record(z.any()).optional(),
	maxUsers: z.number().min(1).max(10000).optional()
});

/**
 * Get shoutbox configuration for admin panel
 */
router.get('/config', isAdmin, async (req: Request, res: Response) => {
	try {
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;
		const config = await ShoutboxService.getConfig(roomId);

		res.json({
			success: true,
			data: config
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching config', { error });
		res.status(500).json({ error: 'Failed to fetch configuration' });
	}
});

/**
 * Update shoutbox configuration (admin only)
 */
router.patch('/config', isAdmin, async (req: Request, res: Response) => {
	try {
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;
		const userId = userService.getUserFromRequest(req);

		const updatedConfig = await ShoutboxService.updateConfig(
			{
				...req.body,
				updatedBy: userId?.toString()
			},
			roomId
		);

		res.json({
			success: true,
			data: updatedConfig,
			message: 'Configuration updated successfully'
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error updating config', { error });
		res.status(500).json({ error: 'Failed to update configuration' });
	}
});

/**
 * Get rooms with comprehensive statistics
 */
router.get('/rooms', isAuthenticatedOptional, async (req: Request, res: Response) => {
	try {
		const userId = userService.getUserFromRequest(req);
		const includeStats = req.query.includeStats === 'true';

		if (includeStats) {
			const roomsWithStats = await RoomService.getRoomsWithStats(userId);
			res.json({ success: true, data: roomsWithStats });
		} else {
			// Use existing simplified logic for backwards compatibility
			const rooms = await db
				.select()
				.from(chatRooms)
				.where(eq(chatRooms.isDeleted, false))
				.orderBy(asc(chatRooms.order));

			res.json(rooms);
		}
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching rooms', { error });
		res.status(500).json({ error: 'Failed to fetch rooms' });
	}
});

/**
 * Create new chat room (admin only)
 */
router.post('/rooms', isAdmin, async (req: Request, res: Response) => {
	try {
		const userId = userService.getUserFromRequest(req);
		const roomData = createRoomSchema.parse({
			...req.body,
			createdBy: userId
		});

		const result = await RoomService.createRoom(roomData);

		if (result.success) {
			res.status(201).json(result);
		} else {
			res.status(400).json(result);
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: 'Invalid room data',
				details: error.errors
			});
		}

		logger.error('Enhanced Shoutbox', 'Error creating room', { error });
		res.status(500).json({ error: 'Failed to create room' });
	}
});

/**
 * Update chat room (admin only)
 */
router.patch('/rooms/:roomId', isAdmin, async (req: Request, res: Response) => {
	try {
		const roomId = req.params.roomId as RoomId;
		const userId = userService.getUserFromRequest(req);

		const result = await RoomService.updateRoom(roomId, req.body, userId);

		if (result.success) {
			res.json(result);
		} else {
			res.status(400).json(result);
		}
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error updating room', { error });
		res.status(500).json({ error: 'Failed to update room' });
	}
});

/**
 * Delete chat room (admin only)
 */
router.delete('/rooms/:roomId', isAdmin, async (req: Request, res: Response) => {
	try {
		const roomId = req.params.roomId as RoomId;
		const userId = userService.getUserFromRequest(req);

		const result = await RoomService.deleteRoom(roomId, userId);

		if (result.success) {
			res.json(result);
		} else {
			res.status(400).json(result);
		}
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error deleting room', { error });
		res.status(500).json({ error: 'Failed to delete room' });
	}
});

/**
 * Reorder rooms (admin only)
 */
router.patch('/rooms/reorder', isAdmin, async (req: Request, res: Response) => {
	try {
		const { roomOrders } = req.body;

		if (!Array.isArray(roomOrders)) {
			return res.status(400).json({ error: 'roomOrders must be an array' });
		}

		const result = await RoomService.reorderRooms(roomOrders);

		if (result.success) {
			res.json(result);
		} else {
			res.status(400).json(result);
		}
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error reordering rooms', { error });
		res.status(500).json({ error: 'Failed to reorder rooms' });
	}
});

/**
 * Get messages with enhanced filtering and pagination
 */
router.get('/messages', isAuthenticatedOptional, async (req: Request, res: Response) => {
	try {
		const userId = userService.getUserFromRequest(req);
		const roomId = req.query.roomId ? (req.query.roomId as string) : null;
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
		const before = req.query.before ? parseInt(req.query.before as string) : null;
		const after = req.query.after ? parseInt(req.query.after as string) : null;
		const includeDeleted = req.query.includeDeleted === 'true';

		// Check room access if specified
		if (roomId && userId) {
			const accessCheck = await RoomService.checkRoomAccess(userId, roomId);
			if (!accessCheck.hasAccess) {
				return res.status(403).json({
					error: 'Access denied',
					reason: accessCheck.reason
				});
			}
		}

		// Get user's ignore list
		const ignoredUsers = userId
			? await RoomService.getUserIgnoreList(userId, roomId || undefined)
			: [];

		// Build query conditions
		const conditions = [
			roomId ? eq(shoutboxMessages.roomId, roomId) : undefined,
			!includeDeleted ? eq(shoutboxMessages.isDeleted, false) : undefined,
			before ? sql`${shoutboxMessages.id} < ${before}` : undefined,
			after ? sql`${shoutboxMessages.id} > ${after}` : undefined,
			ignoredUsers.length > 0 ? not(inArray(shoutboxMessages.userId, ignoredUsers)) : undefined
		].filter(Boolean);

		const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

		// Get messages with user data
		const messages = await db
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
				// User data
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				groupId: users.groupId,
				roles: users.roles,
				usernameColor: users.usernameColor
			})
			.from(shoutboxMessages)
			.leftJoin(users, eq(shoutboxMessages.userId, users.id))
			.where(whereCondition)
			.orderBy(desc(shoutboxMessages.createdAt))
			.limit(limit);

		// Format response
		const formattedMessages = messages.map((msg) => ({
			id: msg.id,
			roomId: msg.roomId,
			content: msg.content,
			createdAt: msg.createdAt,
			editedAt: msg.editedAt,
			isDeleted: msg.isDeleted,
			isPinned: msg.isPinned,
			tipAmount: msg.tipAmount,
			user: msg.userId
				? {
						id: msg.userId,
						username: msg.username,
						avatarUrl: msg.avatarUrl || msg.activeAvatarUrl,
						level: msg.level,
						groupId: msg.groupId,
						roles: msg.roles || [],
						usernameColor: msg.usernameColor
					}
				: null
		}));

		res.json({
			success: true,
			data: formattedMessages,
			meta: {
				count: messages.length,
				hasMore: messages.length === limit,
				oldestId: messages.length > 0 ? messages[messages.length - 1].id : null,
				newestId: messages.length > 0 ? messages[0].id : null
			}
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching messages', { error });
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
});

// Dynamic rate-limiter middleware that picks limiter based on user role/level
async function dynamicRateLimiter(req: Request, res: Response, next: Function) {
	try {
		const userId = userService.getUserFromRequest(req);
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				id: true,
				username: true,
				level: true,
				roles: true,
				groupId: true
			}
		});

		if (!user) return res.status(401).json({ error: 'User not found' });

		let rateLimiter = userRateLimiters.regular;
		if (
			user.roles?.includes('vip') ||
			user.roles?.includes('admin') ||
			user.roles?.includes('moderator')
		) {
			rateLimiter = userRateLimiters.vip;
		} else if (user.level && user.level < 5) {
			rateLimiter = userRateLimiters.newUser;
		}

		// Attach user to request for downstream handlers
		(req as any).currentUser = user;
		return rateLimiter(req, res, next);
	} catch (err) {
		logger.error('Enhanced Shoutbox', 'Rate-limit middleware failed', { err });
		return res.status(429).json({ error: 'Rate limit exceeded' });
	}
}

// Revised POST /messages endpoint: middleware chain enforces rate limiting before handler

router.post(
	'/messages',
	isAuthenticated,
	dynamicRateLimiter,
	async (req: Request, res: Response) => {
		try {
			const userId = userService.getUserFromRequest(req);
			const user = (req as any).currentUser;
			const messageData = messageSchema.parse(req.body);

			// Determine room ID
			let roomId = messageData.roomId;
			if (!roomId) {
				const defaultRoom = await db.query.chatRooms.findFirst({
					where: and(eq(chatRooms.name, 'degen-lounge'), eq(chatRooms.isDeleted, false))
				});
				roomId = defaultRoom?.id || 1;
			}

			const accessCheck = await RoomService.checkRoomAccess(userId, roomId);

			if (!accessCheck.hasAccess) {
				return res.status(403).json({
					error: 'Access denied',
					reason: accessCheck.reason
				});
			}

			// Process message through enhanced service
			const context = {
				userId,
				username: user.username,
				roomId,
				content: messageData.content,
				userRoles: user.roles || [],
				userLevel: user.level || 1,
				ipAddress: req.ip,
				sessionId: req.sessionID
			};

			const result = await ShoutboxService.processMessage(context);

			if (result.success) {
				// Broadcast to WebSocket clients if available
				if (result.broadcastData && req.app && (req.app as any).wss) {
					const clients = (req.app as any).wss.clients;
					for (const client of clients) {
						if (client.readyState === 1) {
							client.send(JSON.stringify(result.broadcastData));
						}
					}
				}

				res.status(201).json({
					success: true,
					message: result.message,
					data: result.data
				});
			} else {
				res.status(400).json({
					error: result.message,
					code: result.error
				});
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					error: 'Invalid message data',
					details: error.errors
				});
			}

			logger.error('Enhanced Shoutbox', 'Error in message endpoint', { error });
			res.status(500).json({ error: 'Failed to send message' });
		}
	}
);

/**
 * Pin/Unpin message (moderator+)
 */
router.patch(
	'/messages/:messageId/pin',
	isAdminOrModerator,
	async (req: Request, res: Response) => {
		try {
			const messageId = req.params.messageId as MessageId;
			const { isPinned } = req.body;
			const userId = userService.getUserFromRequest(req);

			if (typeof isPinned !== 'boolean') {
				return res.status(400).json({ error: 'Invalid parameters' });
			}

			// Check if message exists
			const message = await db.query.shoutboxMessages.findFirst({
				where: eq(shoutboxMessages.id, messageId)
			});

			if (!message) {
				return res.status(404).json({ error: 'Message not found' });
			}

			// Check room configuration for pinning limits
			const config = await ShoutboxService.getConfig(message.roomId);

			if (isPinned && config.maxPinnedMessages) {
				const pinnedCount = await db
					.select({ count: sql<number>`COUNT(*)` })
					.from(shoutboxMessages)
					.where(
						and(
							eq(shoutboxMessages.roomId, message.roomId),
							eq(shoutboxMessages.isPinned, true),
							eq(shoutboxMessages.isDeleted, false)
						)
					);

				if (pinnedCount[0].count >= config.maxPinnedMessages) {
					return res.status(400).json({
						error: `Maximum ${config.maxPinnedMessages} pinned messages allowed`
					});
				}
			}

			// Update message
			const [updatedMessage] = await db
				.update(shoutboxMessages)
				.set({
					isPinned,
					editedAt: new Date()
				})
				.where(eq(shoutboxMessages.id, messageId))
				.returning();

			// Log action
			logger.info('Enhanced Shoutbox', `Message ${isPinned ? 'pinned' : 'unpinned'}`, {
				messageId,
				userId,
				roomId: message.roomId
			});

			// Broadcast update
			if (req.app && (req.app as any).wss) {
				const broadcastData = {
					type: 'chat_update',
					action: isPinned ? 'message_pinned' : 'message_unpinned',
					messageId,
					roomId: message.roomId,
					timestamp: new Date().toISOString()
				};

				const clients = (req.app as any).wss.clients;
				for (const client of clients) {
					if (client.readyState === 1) {
						client.send(JSON.stringify(broadcastData));
					}
				}
			}

			res.json({
				success: true,
				message: `Message ${isPinned ? 'pinned' : 'unpinned'} successfully`,
				data: updatedMessage
			});
		} catch (error) {
			logger.error('Enhanced Shoutbox', 'Error pinning/unpinning message', { error });
			res.status(500).json({ error: 'Failed to update message' });
		}
	}
);

/**
 * Delete message (moderator+)
 */
router.delete('/messages/:messageId', isAdminOrModerator, async (req: Request, res: Response) => {
	try {
		const messageId = req.params.messageId as MessageId;
		const userId = userService.getUserFromRequest(req);

		// Soft delete message
		const [deletedMessage] = await db
			.update(shoutboxMessages)
			.set({
				isDeleted: true,
				editedAt: new Date()
			})
			.where(eq(shoutboxMessages.id, messageId))
			.returning();

		if (!deletedMessage) {
			return res.status(404).json({ error: 'Message not found' });
		}

		// Log action
		logger.info('Enhanced Shoutbox', 'Message deleted', {
			messageId,
			userId,
			roomId: deletedMessage.roomId
		});

		// Broadcast update
		if (req.app && (req.app as any).wss) {
			const broadcastData = {
				type: 'chat_update',
				action: 'message_deleted',
				messageId,
				roomId: deletedMessage.roomId,
				timestamp: new Date().toISOString()
			};

			const clients = (req.app as any).wss.clients;
			for (const client of clients) {
				if (client.readyState === 1) {
					client.send(JSON.stringify(broadcastData));
				}
			}
		}

		res.json({
			success: true,
			message: 'Message deleted successfully'
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error deleting message', { error });
		res.status(500).json({ error: 'Failed to delete message' });
	}
});

/**
 * User ignore system
 */
router.post('/ignore', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = userService.getUserFromRequest(req);
		const { targetUserId, roomId, options } = req.body;

		if (!targetUserId || !isValidId(targetUserId)) {
			return res.status(400).json({ error: 'Invalid target user ID' });
		}

		const result = await RoomService.ignoreUser(
			userId,
			targetUserId as UserId,
			roomId ? (roomId as RoomId) : undefined,
			options
		);

		res.json(result);
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error ignoring user', { error });
		res.status(500).json({ error: 'Failed to ignore user' });
	}
});

router.delete('/ignore/:targetUserId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = userService.getUserFromRequest(req);
		const targetUserId = req.params.targetUserId as UserId;
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;

		if (typeof targetUserId !== 'string') {
			return res.status(400).json({ error: 'Invalid target user ID' });
		}

		const result = await RoomService.unignoreUser(userId, targetUserId, roomId);

		res.json(result);
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error unignoring user', { error });
		res.status(500).json({ error: 'Failed to unignore user' });
	}
});

/**
 * Get shoutbox analytics (admin only)
 */
router.get('/analytics', isAdmin, async (req: Request, res: Response) => {
	try {
		const period = (req.query.period as string) || '24h';
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;

		let timeFilter: any;
		switch (period) {
			case '1h':
				timeFilter = sql`${shoutboxAnalytics.timestamp} >= NOW() - INTERVAL '1 hour'`;
				break;
			case '24h':
				timeFilter = sql`${shoutboxAnalytics.timestamp} >= NOW() - INTERVAL '24 hours'`;
				break;
			case '7d':
				timeFilter = sql`${shoutboxAnalytics.timestamp} >= NOW() - INTERVAL '7 days'`;
				break;
			case '30d':
				timeFilter = sql`${shoutboxAnalytics.timestamp} >= NOW() - INTERVAL '30 days'`;
				break;
			default:
				timeFilter = sql`${shoutboxAnalytics.timestamp} >= NOW() - INTERVAL '24 hours'`;
		}

		const conditions = [
			timeFilter,
			roomId ? eq(shoutboxAnalytics.roomId, roomId) : undefined
		].filter(Boolean);

		// Get event counts by type
		const eventCounts = await db
			.select({
				eventType: shoutboxAnalytics.eventType,
				count: sql<number>`COUNT(*)`
			})
			.from(shoutboxAnalytics)
			.where(and(...conditions))
			.groupBy(shoutboxAnalytics.eventType);

		// Get hourly activity
		const hourlyActivity = await db
			.select({
				hour: sql<number>`EXTRACT(hour FROM ${shoutboxAnalytics.timestamp})`,
				count: sql<number>`COUNT(*)`
			})
			.from(shoutboxAnalytics)
			.where(and(...conditions))
			.groupBy(sql`EXTRACT(hour FROM ${shoutboxAnalytics.timestamp})`)
			.orderBy(sql`EXTRACT(hour FROM ${shoutboxAnalytics.timestamp})`);

		// Get top users by activity
		const topUsers = await db
			.select({
				userId: shoutboxAnalytics.userId,
				username: users.username,
				count: sql<number>`COUNT(*)`
			})
			.from(shoutboxAnalytics)
			.leftJoin(users, eq(shoutboxAnalytics.userId, users.id))
			.where(and(...conditions))
			.groupBy(shoutboxAnalytics.userId, users.username)
			.orderBy(desc(sql`COUNT(*)`))
			.limit(10);

		res.json({
			success: true,
			data: {
				period,
				roomId,
				eventCounts,
				hourlyActivity,
				topUsers
			}
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching analytics', { error });
		res.status(500).json({ error: 'Failed to fetch analytics' });
	}
});

/**
 * Export message history (admin only)
 */
router.get('/export', isAdmin, async (req: Request, res: Response) => {
	try {
		const format = (req.query.format as string) || 'json';
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;
		const dateFrom = req.query.dateFrom as string;
		const dateTo = req.query.dateTo as string;

		// Build query conditions
		const conditions = [
			roomId ? eq(shoutboxMessages.roomId, roomId) : undefined,
			dateFrom ? sql`${shoutboxMessages.createdAt} >= ${dateFrom}` : undefined,
			dateTo ? sql`${shoutboxMessages.createdAt} <= ${dateTo}` : undefined
		].filter(Boolean);

		// Get messages
		const messages = await db
			.select({
				id: shoutboxMessages.id,
				userId: shoutboxMessages.userId,
				username: users.username,
				roomId: shoutboxMessages.roomId,
				roomName: chatRooms.name,
				content: shoutboxMessages.content,
				createdAt: shoutboxMessages.createdAt,
				isDeleted: shoutboxMessages.isDeleted,
				isPinned: shoutboxMessages.isPinned
			})
			.from(shoutboxMessages)
			.leftJoin(users, eq(shoutboxMessages.userId, users.id))
			.leftJoin(chatRooms, eq(shoutboxMessages.roomId, chatRooms.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(asc(shoutboxMessages.createdAt));

		// Format based on requested format
		if (format === 'csv') {
			const csv = [
				'ID,User ID,Username,Room ID,Room Name,Content,Created At,Is Deleted,Is Pinned',
				...messages.map(
					(msg) =>
						`${msg.id},"${msg.userId}","${msg.username}","${msg.roomId}","${msg.roomName}","${msg.content?.replace(/"/g, '""')}","${msg.createdAt}","${msg.isDeleted}","${msg.isPinned}"`
				)
			].join('\n');

			res.setHeader('Content-Type', 'text/csv');
			res.setHeader(
				'Content-Disposition',
				`attachment; filename="shoutbox-export-${Date.now()}.csv"`
			);
			res.send(csv);
		} else {
			res.json({
				success: true,
				data: {
					exportedAt: new Date().toISOString(),
					totalMessages: messages.length,
					filters: { roomId, dateFrom, dateTo },
					messages
				}
			});
		}
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error exporting messages', { error });
		res.status(500).json({ error: 'Failed to export messages' });
	}
});

/**
 * Performance monitoring endpoints
 */

// Get performance statistics (admin only)
router.get('/performance/stats', isAdmin, async (req: Request, res: Response) => {
	try {
		const stats = PerformanceService.getPerformanceStats();
		const cacheStats = ShoutboxCacheService.getCacheStats();
		const queueStats = messageQueue.getStats();

		res.json({
			success: true,
			data: {
				performance: stats,
				cache: cacheStats,
				queue: queueStats,
				generatedAt: new Date().toISOString()
			}
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching performance stats', { error });
		res.status(500).json({ error: 'Failed to fetch performance statistics' });
	}
});

// Get optimization suggestions (admin only)
router.get('/performance/analyze', isAdmin, async (req: Request, res: Response) => {
	try {
		const suggestions = PerformanceService.analyzeQueryPerformance();

		res.json({
			success: true,
			data: {
				suggestions,
				analyzedAt: new Date().toISOString()
			}
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error analyzing performance', { error });
		res.status(500).json({ error: 'Failed to analyze performance' });
	}
});

// Get optimized messages with caching
router.get('/messages/optimized', isAuthenticatedOptional, async (req: Request, res: Response) => {
	try {
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
		const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
		const direction = (req.query.direction as 'before' | 'after') || 'before';
		const userId = userService.getUserFromRequest(req);

		if (!roomId) {
			return res.status(400).json({ error: 'Room ID is required' });
		}

		const result = await PerformanceService.getOptimizedMessages({
			roomId,
			limit,
			cursor,
			direction,
			userId: userId || undefined
		});

		res.json({
			success: true,
			...result
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching optimized messages', { error });
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
});

// Queue management endpoints (admin only)
router.get('/queue/status', isAdmin, async (req: Request, res: Response) => {
	try {
		const userId = req.query.userId ? (req.query.userId as string) : undefined;
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;

		const queuedMessages = messageQueue.getQueuedMessages(userId, roomId);
		const stats = messageQueue.getStats();

		res.json({
			success: true,
			data: {
				stats,
				queuedMessages: queuedMessages.slice(0, 50), // Limit for performance
				totalQueued: queuedMessages.length
			}
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching queue status', { error });
		res.status(500).json({ error: 'Failed to fetch queue status' });
	}
});

// Remove message from queue (admin only)
router.delete('/queue/:messageId', isAdmin, async (req: Request, res: Response) => {
	try {
		const messageId = req.params.messageId;
		const removed = await messageQueue.removeMessage(messageId);

		if (removed) {
			res.json({
				success: true,
				message: 'Message removed from queue'
			});
		} else {
			res.status(404).json({ error: 'Message not found in queue' });
		}
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error removing message from queue', { error });
		res.status(500).json({ error: 'Failed to remove message from queue' });
	}
});

// Cache management endpoints (admin only)
router.post('/cache/clear', isAdmin, async (req: Request, res: Response) => {
	try {
		const { type, roomId } = req.body;

		switch (type) {
			case 'messages':
				if (roomId) {
					ShoutboxCacheService.invalidateMessages(roomId);
				} else {
					// Clear all message caches
					ShoutboxCacheService.clearAll();
				}
				break;
			case 'config':
				ShoutboxCacheService.invalidateRoomConfig(roomId);
				break;
			case 'all':
				ShoutboxCacheService.clearAll();
				break;
			default:
				return res.status(400).json({ error: 'Invalid cache type' });
		}

		res.json({
			success: true,
			message: `Cache cleared for type: ${type}`
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error clearing cache', { error });
		res.status(500).json({ error: 'Failed to clear cache' });
	}
});

// Enhanced message history with performance optimization
router.get('/history/advanced', isAdminOrModerator, async (req: Request, res: Response) => {
	try {
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;
		const userId = req.query.userId ? (req.query.userId as string) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
		const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
		const direction = (req.query.direction as 'before' | 'after') || 'before';
		const includeDeleted = req.query.includeDeleted === 'true';

		const result = await MessageHistoryService.getMessageHistory({
			roomId,
			userId,
			limit,
			cursor,
			direction,
			includeDeleted
		});

		res.json({
			success: true,
			data: result
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching message history', { error });
		res.status(500).json({ error: 'Failed to fetch message history' });
	}
});

// Message statistics for analytics
router.get('/stats/messages', isAdminOrModerator, async (req: Request, res: Response) => {
	try {
		const roomId = req.query.roomId ? (req.query.roomId as string) : undefined;
		const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
		const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
		const groupBy = (req.query.groupBy as 'hour' | 'day' | 'week' | 'month') || 'day';

		const stats = await MessageHistoryService.getMessageStatistics({
			roomId,
			dateFrom,
			dateTo,
			groupBy
		});

		res.json({
			success: true,
			data: stats
		});
	} catch (error) {
		logger.error('Enhanced Shoutbox', 'Error fetching message statistics', { error });
		res.status(500).json({ error: 'Failed to fetch message statistics' });
	}
});

// Active users in room with performance optimization
router.get(
	'/users/active/:roomId',
	isAuthenticatedOptional,
	async (req: Request, res: Response) => {
		try {
			const roomId = req.params.roomId as RoomId;

			if (!roomId) {
				return res.status(400).json({ error: 'Invalid room ID' });
			}

			const activeUsers = await PerformanceService.getActiveUsersInRoom(roomId);

			res.json({
				success: true,
				data: activeUsers
			});
		} catch (error) {
			logger.error('Enhanced Shoutbox', 'Error fetching active users', { error });
			res.status(500).json({ error: 'Failed to fetch active users' });
		}
	}
);

export default router;
