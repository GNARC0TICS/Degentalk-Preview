import { userService } from '@server/src/core/services/user.service';
/**
 * Shoutbox Routes
 *
 * Defines API routes for the shoutbox messaging system.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { MessageId, UserId } from '@shared/types/ids';
import { db } from '@db';
import {
	shoutboxMessages,
	insertShoutboxMessageSchema,
	users,
	chatRooms,
	customEmojis
} from '@schema';
import { sql, desc, eq, and, isNull, inArray, asc, not, or } from 'drizzle-orm';
import { ZodError } from 'zod';
import {
	isAuthenticated,
	isAuthenticatedOptional,
	isAdminOrModerator
} from '../auth/middleware/auth.middleware';
import { getUserId } from '../auth/services/auth.service';
import { canUser } from '@lib/auth/canUser.ts';
import { logger } from '@server/src/core/logger';
import { MentionsService } from '../social/mentions.service';
import type { RoomId, GroupId } from '@shared/types/ids';
import { ShoutboxTransformer } from './transformers/shoutbox.transformer';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@server/src/core/utils/transformer.helpers';

// Rate limiting for shoutbox messages (10 seconds cooldown)
const userLastMessageTime = new Map<UserId, number>();
const COOLDOWN_MS = 10000; // 10 seconds

// Check if user has access to a specific chat room
async function userHasRoomAccess(userId: UserId, roomId: RoomId): Promise<boolean> {
	try {
		// Get the room info
		const roomInfo = await db.select().from(chatRooms).where(eq(chatRooms.id, roomId)).limit(1);

		if (roomInfo.length === 0 || roomInfo[0].isDeleted) {
			return false;
		}

		const room = roomInfo[0];

		// If the room is not private, or if the user created the room, they have access
		if (!room.isPrivate || room.createdBy === userId) {
			return true;
		}

		// Check if the user meets the minimum XP requirement
		if (room.minXpRequired && room.minXpRequired > 0) {
			const userInfo = await db
				.select({ xp: users.xp })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userInfo.length === 0 || !userInfo[0].xp || userInfo[0].xp < room.minXpRequired) {
				return false;
			}
		}

		// Check if the user meets the minimum group requirement
		if (room.minGroupIdRequired) {
			const userInfo = await db
				.select({ groupId: users.groupId })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userInfo.length === 0 || !userInfo[0].groupId) {
				return false;
			}

			// Lower group IDs typically have higher permissions
			// Admin = 1, Moderator = 2, Regular user = 3+
			if (userInfo[0].groupId > room.minGroupIdRequired) {
				return false;
			}
		}

		return true;
	} catch (error) {
		logger.error('ShoutboxRoutes', 'Error checking room access', { err: error, roomId, userId });
		return false;
	}
}

const router = Router();

// Get available chat rooms
router.get('/rooms', async (req: Request, res: Response) => {
	try {
		const userId = userService.getUserFromRequest(req);
		const isAdminOrMod = userService.getUserFromRequest(req)
			? await canUser(
					{
						id: (userService.getUserFromRequest(req) as any).id,
						primaryRoleId: (userService.getUserFromRequest(req) as any).primaryRoleId,
						secondaryRoleIds: (userService.getUserFromRequest(req) as any).secondaryRoleIds
					},
					'canModerateChat'
				)
			: false;

		// Base query - get non-deleted rooms
		let query = db
			.select({
				id: chatRooms.id,
				name: chatRooms.name,
				description: chatRooms.description,
				isPrivate: chatRooms.isPrivate,
				minXpRequired: chatRooms.minXpRequired,
				createdAt: chatRooms.createdAt,
				createdBy: chatRooms.createdBy,
				order: chatRooms.order
			})
			.from(chatRooms)
			.where(eq(chatRooms.isDeleted, false))
			.orderBy(asc(chatRooms.order));

		// If user is not admin/mod, exclude private rooms they don't have access to
		if (!isAdminOrMod && userId) {
			// For logged-in regular users, filter rooms they can access:
			// 1. Public rooms (not private)
			// 2. Private rooms where they meet the group requirement
			query = db
				.select({
					id: chatRooms.id,
					name: chatRooms.name,
					description: chatRooms.description,
					isPrivate: chatRooms.isPrivate,
					minXpRequired: chatRooms.minXpRequired,
					createdAt: chatRooms.createdAt,
					createdBy: chatRooms.createdBy,
					order: chatRooms.order
				})
				.from(chatRooms)
				.where(
					and(
						eq(chatRooms.isDeleted, false),
						or(
							eq(chatRooms.isPrivate, false),
							and(
								eq(chatRooms.isPrivate, true),
								or(
									// User created the room
									eq(chatRooms.createdBy, userId),
									// User meets minimum group requirement (lower groupId = higher permission)
									sql`(
                  SELECT ${users.groupId} FROM ${users} 
                  WHERE ${users.id} = ${userId}
                ) <= ${chatRooms.minGroupIdRequired}`
								)
							)
						)
					)
				)
				.orderBy(asc(chatRooms.order));
		} else if (!userId) {
			// For guests, only show public rooms
			query = db
				.select({
					id: chatRooms.id,
					name: chatRooms.name,
					description: chatRooms.description,
					isPrivate: chatRooms.isPrivate,
					minXpRequired: chatRooms.minXpRequired,
					createdAt: chatRooms.createdAt,
					createdBy: chatRooms.createdBy,
					order: chatRooms.order
				})
				.from(chatRooms)
				.where(and(eq(chatRooms.isDeleted, false), eq(chatRooms.isPrivate, false)))
				.orderBy(asc(chatRooms.order));
		}

		const rooms = await query;

		// Add accessibility information for the current user
		const roomsWithAccess = rooms.map((room) => {
			const accessible = !room.isPrivate || isAdminOrMod || (userId && room.createdBy === userId);

			return {
				...room,
				accessible,
				locked: !accessible
			};
		});

		sendTransformedListResponse(res, roomsWithAccess, ShoutboxTransformer.toPublicShoutbox);
	} catch (error) {
		logger.error('ShoutboxRoutes', 'Error fetching chat rooms', { err: error });
		sendErrorResponse(res, 'Failed to fetch chat rooms', 500);
	}
});

// Moderation endpoint: Delete (soft delete) a shoutbox message with WebSocket notification
router.delete('/messages/:id', isAdminOrModerator, async (req: Request, res: Response) => {
	try {
		const messageId = req.params.id as MessageId;

		// Check if message exists
		const existingMessage = await db
			.select()
			.from(shoutboxMessages)
			.where(eq(shoutboxMessages.id, messageId))
			.limit(1);

		if (existingMessage.length === 0) {
			return sendErrorResponse(res, 'Message not found', 404);
		}

		// Soft delete the message (mark as deleted)
		const result = await db
			.update(shoutboxMessages)
			.set({
				isDeleted: true,
				editedAt: new Date()
			})
			.where(eq(shoutboxMessages.id, messageId))
			.returning();

		// Log the moderation action
		const moderatorId = userService.getUserFromRequest(req);
		logger.info('ShoutboxRoutes', `User ${moderatorId} deleted shoutbox message ${messageId}`, {
			moderatorId,
			messageId,
			action: 'delete_shoutbox_message'
		});

		const deletedMessage = result[0];

		// Notify connected clients about the deletion
		if (req.app && (req.app as any).wss && (req.app as any).wss.clients) {
			const clients = (req.app as any).wss.clients;
			const broadcastData = {
				type: 'chat_update',
				action: 'message_deleted',
				messageId: messageId,
				roomId: deletedMessage.roomId,
				timestamp: new Date().toISOString()
			};

			for (const client of clients) {
				if (client.readyState === 1) {
					// WebSocket.OPEN
					client.send(JSON.stringify(broadcastData));
				}
			}
		}

		sendTransformedResponse(res, deletedMessage, ShoutboxTransformer.toAdminShout, 'Message deleted successfully');
	} catch (error) {
		// console.error('Error deleting shoutbox message:', error); // Original console.error removed
		const messageIdForLog = req.params.id as MessageId; // Ensure messageId is available for logging
		logger.error('ShoutboxRoutes', 'Error deleting shoutbox message', {
			err: error,
			messageId: messageIdForLog
		});
		sendErrorResponse(res, 'Failed to delete message', 500);
	}
});

// Get latest shoutbox messages - now with room support
router.get('/messages', async (req: Request, res: Response) => {
	try {
		const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
		const roomId = req.query.roomId ? (req.query.roomId as string) as RoomId : null;
		const currentUserId = userService.getUserFromRequest(req);

		// Check if the user has access to the specified room
		if (roomId && currentUserId) {
			const hasAccess = await userHasRoomAccess(currentUserId, roomId);
			if (!hasAccess) {
				return sendErrorResponse(res, 'You do not have access to this room', 403);
			}
		} else if (roomId && !currentUserId) {
			// If guest tries to access a specific room, check if it's public
			const roomInfo = await db
				.select({ isPrivate: chatRooms.isPrivate })
				.from(chatRooms)
				.where(eq(chatRooms.id, roomId))
				.limit(1);
			if (roomInfo.length === 0 || roomInfo[0].isPrivate) {
				return sendErrorResponse(res, 'You do not have access to this room', 403);
			}
		}

		// Variable to hold our where condition
		let whereCondition;
		let targetRoomId: RoomId | null = roomId;

		// Determine the target room ID if not explicitly provided
		if (!targetRoomId) {
			try {
				const defaultRoom = await db
					.select({ id: chatRooms.id })
					.from(chatRooms)
					.where(and(eq(chatRooms.name, 'degen-lounge'), eq(chatRooms.isDeleted, false)))
					.limit(1);
				if (defaultRoom.length > 0) {
					targetRoomId = defaultRoom[0].id;
				} else {
					// If no default room, maybe return empty or fetch from all public rooms?
					// For now, let's return empty if no room is specified and default doesn't exist.
					return sendSuccessResponse(res, []);
				}
			} catch (error) {
				logger.warn('ShoutboxRoutes', 'Error fetching default room', { err: error });
				return sendErrorResponse(res, 'Failed to determine chat room', 500);
			}
		}

		// Ensure we have a target room ID to filter by
		if (!targetRoomId) {
			// This case should ideally not be reached if the logic above is sound
			return sendErrorResponse(res, 'Could not determine the target chat room', 400);
		}

		whereCondition = eq(shoutboxMessages.roomId, targetRoomId);

		// Perform a single query with LEFT JOIN
		const messagesWithUsers = await db
			.select({
				// Message fields
				id: shoutboxMessages.id,
				userId: shoutboxMessages.userId,
				roomId: shoutboxMessages.roomId,
				content: shoutboxMessages.content,
				createdAt: shoutboxMessages.createdAt,
				editedAt: shoutboxMessages.editedAt,
				isDeleted: shoutboxMessages.isDeleted,
				isPinned: shoutboxMessages.isPinned,
				tipAmount: shoutboxMessages.tipAmount,
				// User fields (prefixed)
				u_id: users.id,
				u_username: users.username,
				u_avatarUrl: users.avatarUrl,
				u_activeAvatarUrl: users.activeAvatarUrl,
				u_level: users.level,
				u_groupId: users.groupId,
				u_isActive: users.isActive, // Include flags to check status
				u_isBanned: users.isBanned
			})
			.from(shoutboxMessages)
			.leftJoin(users, eq(shoutboxMessages.userId, users.id))
			.where(
				and(
					whereCondition // Filter by the target room
					// Optionally hide deleted messages unless requested?
					// For now, include deleted messages and let frontend handle visibility
				)
			)
			.orderBy(desc(shoutboxMessages.createdAt))
			.limit(limit);

		// Process the results
		const messages = messagesWithUsers.map((row) => {
			let user = null;
			// Check if user exists and is active/not banned
			if (row.u_id && row.u_isActive && !row.u_isBanned) {
				user = {
					id: row.u_id,
					username: row.u_username,
					avatarUrl: row.u_avatarUrl,
					activeAvatarUrl: row.u_activeAvatarUrl,
					level: row.u_level,
					groupId: row.u_groupId
				};
			} else if (row.u_id) {
				// User exists but is inactive or banned
				user = {
					id: row.u_id,
					username: row.u_username || '[Inactive User]',
					avatarUrl: null,
					activeAvatarUrl: null,
					level: 1,
					groupId: null, // Indicate inactive/banned status
					isInactiveOrBanned: true
				};
			} else {
				// User ID was likely null in the message, or user truly deleted
				user = {
					id: row.userId, // Keep original ID if available
					username: '[Deleted User]',
					avatarUrl: null,
					activeAvatarUrl: null,
					level: 1,
					groupId: null,
					isDeleted: true
				};
			}

			return {
				id: row.id,
				roomId: row.roomId,
				content: row.content,
				createdAt: row.createdAt,
				editedAt: row.editedAt,
				isDeleted: row.isDeleted,
				isPinned: row.isPinned,
				tipAmount: row.tipAmount,
				user // Attach the processed user object
			};
		});

		sendSuccessResponse(res, messages);
	} catch (error) {
		const roomIdForLog = req.query.roomId ? (req.query.roomId as string) as RoomId : null;
		const limitForLog = req.query.limit ? parseInt(req.query.limit as string) : 50;
		logger.error('ShoutboxRoutes', 'Error fetching shoutbox messages', {
			err: error,
			roomId: roomIdForLog,
			limit: limitForLog
		});
		sendErrorResponse(res, 'Failed to fetch shoutbox messages', 500);
	}
});

// Post a new shoutbox message - now with room support and WebSocket broadcast
router.post('/messages', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = userService.getUserFromRequest(req);
		const { roomId } = req.body;

		// Check rate limiting
		const lastMessageTime = userLastMessageTime.get(userId) || 0;
		const now = Date.now();

		if (now - lastMessageTime < COOLDOWN_MS) {
			const waitTime = Math.ceil((COOLDOWN_MS - (now - lastMessageTime)) / 1000);
			return sendErrorResponse(res, `Please wait ${waitTime} seconds before sending another message`, 429);
		}

		// If roomId is provided, check if user has access to this room
		if (roomId) {
			const hasAccess = await userHasRoomAccess(userId, roomId);
			if (!hasAccess) {
				return sendErrorResponse(res, 'You do not have access to this room', 403);
			}
		} else {
			// If no roomId specified, get the default room (degen-lounge)
			const defaultRoom = await db
				.select()
				.from(chatRooms)
				.where(eq(chatRooms.name, 'degen-lounge'))
				.limit(1);

			if (defaultRoom.length > 0) {
				req.body.roomId = defaultRoom[0].id;
			}
		}

		// Validate message data
		const messageData = insertShoutboxMessageSchema.parse({
			...req.body,
			userId
		});

		// Insert message
		const result = await db.insert(shoutboxMessages).values(messageData).returning();
		const newMessage = result[0];

		// Update rate limit tracking
		userLastMessageTime.set(userId, now);

		// Process mentions in the shoutbox message
		try {
			await MentionsService.processMentions({
				content: messageData.content,
				mentioningUserId: userId.toString(),
				type: 'shoutbox',
				messageId: newMessage.id.toString(),
				context: `Shoutbox message in room ${newMessage.roomId}`
			});
		} catch (mentionError) {
			logger.error('ShoutboxRoutes', 'Error processing mentions for shoutbox message', {
				err: mentionError,
				messageId: newMessage.id,
				userId
			});
			// Don't fail the message creation if mentions fail
		}

		// Get user data to return with the message
		const userData = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				groupId: users.groupId
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		const responseData = {
			...newMessage,
			user: userData[0]
		};

		// Broadcast the message to all connected WebSocket clients
		if (req.app && (req.app as any).wss && (req.app as any).wss.clients) {
			const clients = (req.app as any).wss.clients;
			const broadcastData = {
				type: 'chat_update',
				action: 'new_message',
				message: responseData,
				roomId: newMessage.roomId,
				timestamp: new Date().toISOString()
			};

			for (const client of clients) {
				if (client.readyState === 1) {
					// WebSocket.OPEN
					client.send(JSON.stringify(broadcastData));
				}
			}
		}

		res.status(201);
		sendSuccessResponse(res, responseData);
	} catch (error) {
		if (error instanceof ZodError) {
			return sendErrorResponse(res, 'Invalid message data', 400);
		}

		const userIdForLog = userService.getUserFromRequest(req); // Ensure userId is available
		const roomIdForLog = req.body.roomId; // Get roomId from request body for logging context
		logger.error('ShoutboxRoutes', 'Error creating shoutbox message', {
			err: error,
			userId: userIdForLog,
			roomId: roomIdForLog
		});
		sendErrorResponse(res, 'Failed to create shoutbox message', 500);
	}
});

// Update a shoutbox message (for pinning/unpinning) - admin/mod only with WebSocket notification
router.patch('/messages/:id', isAdminOrModerator, async (req: Request, res: Response) => {
	try {
		const messageId = req.params.id as MessageId;

		// Check if message exists
		const existingMessage = await db
			.select()
			.from(shoutboxMessages)
			.where(eq(shoutboxMessages.id, messageId))
			.limit(1);

		if (existingMessage.length === 0) {
			return sendErrorResponse(res, 'Message not found', 404);
		}

		// Validate update data - currently only supporting isPinned
		const { isPinned } = req.body;

		// Check if isPinned is a boolean
		if (typeof isPinned !== 'boolean') {
			return sendErrorResponse(res, 'isPinned must be a boolean value', 400);
		}

		// Update the message
		const result = await db
			.update(shoutboxMessages)
			.set({
				isPinned,
				editedAt: new Date() // Update the edited timestamp
			})
			.where(eq(shoutboxMessages.id, messageId))
			.returning();

		// Log the moderation action
		const moderatorId = userService.getUserFromRequest(req);
		logger.info(
			'ShoutboxRoutes',
			`User ${moderatorId} ${isPinned ? 'pinned' : 'unpinned'} shoutbox message ${messageId}`,
			{
				moderatorId,
				messageId,
				action: isPinned ? 'pin_shoutbox_message' : 'unpin_shoutbox_message',
				isPinned
			}
		);

		const updatedMessage = result[0];

		// Notify connected clients about the pin/unpin action
		if (req.app && (req.app as any).wss && (req.app as any).wss.clients) {
			const clients = (req.app as any).wss.clients;
			const broadcastData = {
				type: 'chat_update',
				action: isPinned ? 'message_pinned' : 'message_unpinned',
				messageId: messageId,
				roomId: updatedMessage.roomId,
				timestamp: new Date().toISOString()
			};

			for (const client of clients) {
				if (client.readyState === 1) {
					// WebSocket.OPEN
					client.send(JSON.stringify(broadcastData));
				}
			}
		}

		sendTransformedResponse(res, updatedMessage, ShoutboxTransformer.toAdminShout, isPinned ? 'Message pinned successfully' : 'Message unpinned successfully');
	} catch (error) {
		// console.error('Error updating shoutbox message:', error); // Original console.error removed
		const messageIdForLog = req.params.id as MessageId; // Ensure messageId is available
		const isPinnedForLog = req.body.isPinned; // Ensure isPinned is available
		logger.error('ShoutboxRoutes', 'Error updating shoutbox message', {
			err: error,
			messageId: messageIdForLog,
			isPinned: isPinnedForLog
		});
		sendErrorResponse(res, 'Failed to update message', 500);
	}
});

export default router;
