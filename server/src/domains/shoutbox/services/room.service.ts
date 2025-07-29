/**
 * Enhanced Chat Room Service
 *
 * Handles chat room creation, management, and access control
 * with admin configuration and multi-room support
 */

import { db } from '@degentalk/db';
import type { UserId } from '@shared/types/ids';
import { chatRooms, users, shoutboxConfig, shoutboxMessages, shoutboxUserIgnores } from '@schema';
import { eq, and, or, desc, asc, sql, gt, lt, isNull, inArray, not, count } from 'drizzle-orm';
import { logger } from '@core/logger';
import { createId } from '@paralleldrive/cuid2';
import type { RoomId, GroupId } from '@shared/types/ids';
import type { EntityId } from '@shared/types/ids';

export interface CreateRoomData {
	name: string;
	description?: string;
	isPrivate?: boolean;
	minXpRequired?: number;
	minGroupIdRequired?: GroupId;
	order?: number;
	createdBy: number;
	accessRoles?: string[];
	themeConfig?: any;
	maxUsers?: number;
}

export interface RoomWithStats {
	id: EntityId;
	name: string;
	description: string | null;
	isPrivate: boolean;
	minXpRequired: number | null;
	minGroupIdRequired: GroupId | null;
	order: number | null;
	createdAt: Date;
	createdBy: number;
	isDeleted: boolean;
	accessRoles: string[] | null;
	themeConfig: any;
	maxUsers: number | null;

	// Stats
	messageCount: number;
	activeUsers: number;
	onlineUsers: number;
	lastActivity: Date | null;
	pinnedMessageCount: number;
}

export class RoomService {
	private static cache = new Map<string, any>();
	private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	/**
	 * Create a new chat room (admin only)
	 */
	static async createRoom(roomData: CreateRoomData): Promise<{
		success: boolean;
		room?: any;
		message: string;
		error?: string;
	}> {
		try {
			// Validate room name
			if (!roomData.name || roomData.name.length < 3 || roomData.name.length > 50) {
				return {
					success: false,
					message: 'Room name must be between 3 and 50 characters',
					error: 'INVALID_ROOM_NAME'
				};
			}

			// Check if room name already exists
			const existingRoom = await db.query.chatRooms.findFirst({
				where: and(eq(chatRooms.name, roomData.name), eq(chatRooms.isDeleted, false))
			});

			if (existingRoom) {
				return {
					success: false,
					message: 'A room with this name already exists',
					error: 'ROOM_NAME_EXISTS'
				};
			}

			// Get next order if not specified
			let order = roomData.order;
			if (!order) {
				const maxOrderResult = await db
					.select({
						maxOrder: sql<number>`COALESCE(MAX(${chatRooms.order}), 0)`
					})
					.from(chatRooms)
					.where(eq(chatRooms.isDeleted, false));

				order = (maxOrderResult[0]?.maxOrder || 0) + 1;
			}

			// Create the room
			const [newRoom] = await db
				.insert(chatRooms)
				.values({
					name: roomData.name,
					description: roomData.description || null,
					isPrivate: roomData.isPrivate || false,
					minXpRequired: roomData.minXpRequired || null,
					minGroupIdRequired: roomData.minGroupIdRequired || null,
					order: order,
					createdBy: roomData.createdBy,
					accessRoles: roomData.accessRoles || null,
					themeConfig: roomData.themeConfig || {},
					maxUsers: roomData.maxUsers || null
				})
				.returning();

			// Create room-specific configuration if provided
			if (roomData.themeConfig || roomData.maxUsers) {
				await this.createRoomConfig(newRoom.id, roomData);
			}

			logger.info('RoomService', 'Chat room created', {
				roomId: newRoom.id,
				roomName: newRoom.name,
				createdBy: roomData.createdBy
			});

			return {
				success: true,
				room: newRoom,
				message: 'Chat room created successfully'
			};
		} catch (error) {
			logger.error('RoomService', 'Error creating chat room', { error, roomData });
			return {
				success: false,
				message: 'Failed to create chat room',
				error: 'ROOM_CREATION_FAILED'
			};
		}
	}

	/**
	 * Update an existing chat room
	 */
	static async updateRoom(
		roomId: RoomId,
		updateData: Partial<CreateRoomData>,
		updatedBy: UserId
	): Promise<{
		success: boolean;
		room?: any;
		message: string;
		error?: string;
	}> {
		try {
			// Check if room exists
			const existingRoom = await db.query.chatRooms.findFirst({
				where: and(eq(chatRooms.id, roomId), eq(chatRooms.isDeleted, false))
			});

			if (!existingRoom) {
				return {
					success: false,
					message: 'Chat room not found',
					error: 'ROOM_NOT_FOUND'
				};
			}

			// If updating name, check for conflicts
			if (updateData.name && updateData.name !== existingRoom.name) {
				const nameConflict = await db.query.chatRooms.findFirst({
					where: and(
						eq(chatRooms.name, updateData.name),
						eq(chatRooms.isDeleted, false),
						not(eq(chatRooms.id, roomId))
					)
				});

				if (nameConflict) {
					return {
						success: false,
						message: 'A room with this name already exists',
						error: 'ROOM_NAME_EXISTS'
					};
				}
			}

			// Update the room
			const [updatedRoom] = await db
				.update(chatRooms)
				.set({
					name: updateData.name || existingRoom.name,
					description:
						updateData.description !== undefined
							? updateData.description
							: existingRoom.description,
					isPrivate:
						updateData.isPrivate !== undefined ? updateData.isPrivate : existingRoom.isPrivate,
					minXpRequired:
						updateData.minXpRequired !== undefined
							? updateData.minXpRequired
							: existingRoom.minXpRequired,
					minGroupIdRequired:
						updateData.minGroupIdRequired !== undefined
							? updateData.minGroupIdRequired
							: existingRoom.minGroupIdRequired,
					order: updateData.order !== undefined ? updateData.order : existingRoom.order,
					accessRoles:
						updateData.accessRoles !== undefined
							? updateData.accessRoles
							: existingRoom.accessRoles,
					themeConfig:
						updateData.themeConfig !== undefined
							? updateData.themeConfig
							: existingRoom.themeConfig,
					maxUsers: updateData.maxUsers !== undefined ? updateData.maxUsers : existingRoom.maxUsers
				})
				.where(eq(chatRooms.id, roomId))
				.returning();

			// Update room-specific configuration
			if (updateData.themeConfig || updateData.maxUsers !== undefined) {
				await this.updateRoomConfig(roomId, updateData);
			}

			// Clear cache
			this.clearRoomCache(roomId);

			logger.info('RoomService', 'Chat room updated', {
				roomId,
				updatedBy,
				changes: Object.keys(updateData)
			});

			return {
				success: true,
				room: updatedRoom,
				message: 'Chat room updated successfully'
			};
		} catch (error) {
			logger.error('RoomService', 'Error updating chat room', { error, roomId, updateData });
			return {
				success: false,
				message: 'Failed to update chat room',
				error: 'ROOM_UPDATE_FAILED'
			};
		}
	}

	/**
	 * Delete a chat room (soft delete)
	 */
	static async deleteRoom(
		roomId: RoomId,
		deletedBy: UserId
	): Promise<{
		success: boolean;
		message: string;
		error?: string;
	}> {
		try {
			// Check if room exists and is not already deleted
			const existingRoom = await db.query.chatRooms.findFirst({
				where: and(eq(chatRooms.id, roomId), eq(chatRooms.isDeleted, false))
			});

			if (!existingRoom) {
				return {
					success: false,
					message: 'Chat room not found',
					error: 'ROOM_NOT_FOUND'
				};
			}

			// Prevent deletion of default room
			if (existingRoom.name === 'degen-lounge') {
				return {
					success: false,
					message: 'Cannot delete the default chat room',
					error: 'CANNOT_DELETE_DEFAULT'
				};
			}

			// Soft delete the room
			await db
				.update(chatRooms)
				.set({
					isDeleted: true,
					deletedAt: new Date()
				})
				.where(eq(chatRooms.id, roomId));

			// Also soft delete all messages in the room
			await db
				.update(shoutboxMessages)
				.set({
					isDeleted: true,
					editedAt: new Date()
				})
				.where(eq(shoutboxMessages.roomId, roomId));

			// Clear cache
			this.clearRoomCache(roomId);
			this.clearRoomCache(); // Clear general room list cache

			logger.info('RoomService', 'Chat room deleted', {
				roomId,
				roomName: existingRoom.name,
				deletedBy
			});

			return {
				success: true,
				message: 'Chat room deleted successfully'
			};
		} catch (error) {
			logger.error('RoomService', 'Error deleting chat room', { error, roomId });
			return {
				success: false,
				message: 'Failed to delete chat room',
				error: 'ROOM_DELETION_FAILED'
			};
		}
	}

	/**
	 * Get all chat rooms with statistics
	 */
	static async getRoomsWithStats(userId?: UserId): Promise<RoomWithStats[]> {
		const cacheKey = `rooms-with-stats:${userId || 'guest'}`;

		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		try {
			// Base query for rooms
			let roomsQuery = db
				.select({
					id: chatRooms.id,
					name: chatRooms.name,
					description: chatRooms.description,
					isPrivate: chatRooms.isPrivate,
					minXpRequired: chatRooms.minXpRequired,
					minGroupIdRequired: chatRooms.minGroupIdRequired,
					order: chatRooms.order,
					createdAt: chatRooms.createdAt,
					createdBy: chatRooms.createdBy,
					isDeleted: chatRooms.isDeleted,
					accessRoles: chatRooms.accessRoles,
					themeConfig: chatRooms.themeConfig,
					maxUsers: chatRooms.maxUsers
				})
				.from(chatRooms)
				.where(eq(chatRooms.isDeleted, false));

			// If user is specified, filter rooms they can access
			if (userId) {
				const userInfo = await db.query.users.findFirst({
					where: eq(users.id, userId),
					columns: { groupId: true, xp: true }
				});

				if (userInfo) {
					roomsQuery = roomsQuery.where(
						or(
							eq(chatRooms.isPrivate, false),
							eq(chatRooms.createdBy, userId),
							and(
								eq(chatRooms.isPrivate, true),
								or(
									isNull(chatRooms.minGroupIdRequired),
									sql`${userInfo.groupId} <= ${chatRooms.minGroupIdRequired}`
								),
								or(
									isNull(chatRooms.minXpRequired),
									sql`${userInfo.xp} >= ${chatRooms.minXpRequired}`
								)
							)
						)
					);
				}
			} else {
				// Guest users can only see public rooms
				roomsQuery = roomsQuery.where(eq(chatRooms.isPrivate, false));
			}

			const rooms = await roomsQuery.orderBy(asc(chatRooms.order));

			// Get statistics for each room
			const roomsWithStats: RoomWithStats[] = await Promise.all(
				rooms.map(async (room) => {
					const stats = await this.getRoomStats(room.id);
					return {
						...room,
						...stats
					};
				})
			);

			// Cache the result
			this.cache.set(cacheKey, roomsWithStats);
			setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);

			return roomsWithStats;
		} catch (error) {
			logger.error('RoomService', 'Error getting rooms with stats', { error, userId });
			return [];
		}
	}

	/**
	 * Get statistics for a specific room
	 */
	static async getRoomStats(roomId: RoomId): Promise<{
		messageCount: number;
		activeUsers: number;
		onlineUsers: number;
		lastActivity: Date | null;
		pinnedMessageCount: number;
	}> {
		try {
			// Get message count
			const messageCountResult = await db
				.select({
					count: count(shoutboxMessages.id)
				})
				.from(shoutboxMessages)
				.where(and(eq(shoutboxMessages.roomId, roomId), eq(shoutboxMessages.isDeleted, false)));

			// Get pinned message count
			const pinnedCountResult = await db
				.select({
					count: count(shoutboxMessages.id)
				})
				.from(shoutboxMessages)
				.where(
					and(
						eq(shoutboxMessages.roomId, roomId),
						eq(shoutboxMessages.isDeleted, false),
						eq(shoutboxMessages.isPinned, true)
					)
				);

			// Get last activity
			const lastActivityResult = await db
				.select({
					lastActivity: sql<Date>`MAX(${shoutboxMessages.createdAt})`
				})
				.from(shoutboxMessages)
				.where(and(eq(shoutboxMessages.roomId, roomId), eq(shoutboxMessages.isDeleted, false)));

			// Get active users (users who posted in last 24 hours)
			const activeUsersResult = await db
				.select({
					count: sql<number>`COUNT(DISTINCT ${shoutboxMessages.userId})`
				})
				.from(shoutboxMessages)
				.where(
					and(
						eq(shoutboxMessages.roomId, roomId),
						eq(shoutboxMessages.isDeleted, false),
						gt(shoutboxMessages.createdAt, sql`NOW() - INTERVAL '24 hours'`)
					)
				);

			return {
				messageCount: messageCountResult[0]?.count || 0,
				activeUsers: activeUsersResult[0]?.count || 0,
				onlineUsers: 0, // Would need WebSocket connection tracking
				lastActivity: lastActivityResult[0]?.lastActivity || null,
				pinnedMessageCount: pinnedCountResult[0]?.count || 0
			};
		} catch (error) {
			logger.error('RoomService', 'Error getting room stats', { error, roomId });
			return {
				messageCount: 0,
				activeUsers: 0,
				onlineUsers: 0,
				lastActivity: null,
				pinnedMessageCount: 0
			};
		}
	}

	/**
	 * Check if user has access to a room
	 */
	static async checkRoomAccess(
		userId: UserId,
		roomId: RoomId
	): Promise<{
		hasAccess: boolean;
		reason?: string;
	}> {
		try {
			const room = await db.query.chatRooms.findFirst({
				where: and(eq(chatRooms.id, roomId), eq(chatRooms.isDeleted, false))
			});

			if (!room) {
				return { hasAccess: false, reason: 'Room not found' };
			}

			// Public rooms are accessible to all authenticated users
			if (!room.isPrivate) {
				return { hasAccess: true };
			}

			// Room creator always has access
			if (room.createdBy === userId) {
				return { hasAccess: true };
			}

			// Check user requirements
			const user = await db.query.users.findFirst({
				where: eq(users.id, userId),
				columns: { groupId: true, xp: true, roles: true }
			});

			if (!user) {
				return { hasAccess: false, reason: 'User not found' };
			}

			// Check XP requirement
			if (room.minXpRequired && user.xp && user.xp < room.minXpRequired) {
				return { hasAccess: false, reason: `Requires ${room.minXpRequired} XP` };
			}

			// Check group requirement (lower groupId = higher permission)
			if (room.minGroupIdRequired && user.groupId && user.groupId > room.minGroupIdRequired) {
				return { hasAccess: false, reason: 'Insufficient permissions' };
			}

			// Check role requirements
			if (room.accessRoles && room.accessRoles.length > 0) {
				const userRoles = user.roles || [];
				const hasRequiredRole = room.accessRoles.some((role) => userRoles.includes(role));
				if (!hasRequiredRole) {
					return { hasAccess: false, reason: 'Role requirements not met' };
				}
			}

			return { hasAccess: true };
		} catch (error) {
			logger.error('RoomService', 'Error checking room access', { error, userId, roomId });
			return { hasAccess: false, reason: 'Access check failed' };
		}
	}

	/**
	 * Get user's ignored users for a room
	 */
	static async getUserIgnoreList(userId: UserId, roomId?: RoomId): Promise<UserId[]> {
		try {
			const ignoreList = await db
				.select({
					ignoredUserId: shoutboxUserIgnores.ignoredUserId
				})
				.from(shoutboxUserIgnores)
				.where(
					and(
						eq(shoutboxUserIgnores.userId, userId.toString()),
						roomId
							? eq(shoutboxUserIgnores.roomId, roomId.toString())
							: isNull(shoutboxUserIgnores.roomId)
					)
				);

			return ignoreList.map((item) => item.ignoredUserId as UserId);
		} catch (error) {
			logger.error('RoomService', 'Error getting ignore list', { error, userId, roomId });
			return [];
		}
	}

	/**
	 * Add user to ignore list
	 */
	static async ignoreUser(
		userId: UserId,
		ignoredUserId: UserId,
		roomId?: RoomId,
		options?: {
			hideMessages?: boolean;
			hideCommands?: boolean;
			hideMentions?: boolean;
		}
	): Promise<{ success: boolean; message: string }> {
		try {
			// Check if already ignoring
			const existing = await db.query.shoutboxUserIgnores.findFirst({
				where: and(
					eq(shoutboxUserIgnores.userId, userId.toString()),
					eq(shoutboxUserIgnores.ignoredUserId, ignoredUserId.toString()),
					roomId
						? eq(shoutboxUserIgnores.roomId, roomId.toString())
						: isNull(shoutboxUserIgnores.roomId)
				)
			});

			if (existing) {
				return { success: false, message: 'User is already ignored' };
			}

			// Add to ignore list
			await db.insert(shoutboxUserIgnores).values({
				userId: userId.toString(),
				ignoredUserId: ignoredUserId.toString(),
				roomId: roomId?.toString() || null,
				hideMessages: options?.hideMessages ?? true,
				hideCommands: options?.hideCommands ?? true,
				hideMentions: options?.hideMentions ?? true
			});

			return { success: true, message: 'User added to ignore list' };
		} catch (error) {
			logger.error('RoomService', 'Error ignoring user', { error, userId, ignoredUserId, roomId });
			return { success: false, message: 'Failed to ignore user' };
		}
	}

	/**
	 * Remove user from ignore list
	 */
	static async unignoreUser(
		userId: UserId,
		ignoredUserId: UserId,
		roomId?: RoomId
	): Promise<{ success: boolean; message: string }> {
		try {
			const result = await db
				.delete(shoutboxUserIgnores)
				.where(
					and(
						eq(shoutboxUserIgnores.userId, userId.toString()),
						eq(shoutboxUserIgnores.ignoredUserId, ignoredUserId.toString()),
						roomId
							? eq(shoutboxUserIgnores.roomId, roomId.toString())
							: isNull(shoutboxUserIgnores.roomId)
					)
				);

			return { success: true, message: 'User removed from ignore list' };
		} catch (error) {
			logger.error('RoomService', 'Error unignoring user', {
				error,
				userId,
				ignoredUserId,
				roomId
			});
			return { success: false, message: 'Failed to unignore user' };
		}
	}

	/**
	 * Create room-specific configuration
	 */
	private static async createRoomConfig(roomId: RoomId, roomData: CreateRoomData): Promise<void> {
		try {
			await db.insert(shoutboxConfig).values({
				scope: 'room',
				roomId: roomId.toString(),
				themeConfig: roomData.themeConfig || {},
				maxConcurrentUsers: roomData.maxUsers || 1000,
				createdBy: roomData.createdBy.toString()
			});
		} catch (error) {
			logger.error('RoomService', 'Error creating room config', { error, roomId });
		}
	}

	/**
	 * Update room-specific configuration
	 */
	private static async updateRoomConfig(
		roomId: RoomId,
		updateData: Partial<CreateRoomData>
	): Promise<void> {
		try {
			const updateValues: any = {};

			if (updateData.themeConfig !== undefined) {
				updateValues.themeConfig = updateData.themeConfig;
			}

			if (updateData.maxUsers !== undefined) {
				updateValues.maxConcurrentUsers = updateData.maxUsers;
			}

			if (Object.keys(updateValues).length > 0) {
				updateValues.updatedAt = new Date();

				await db
					.update(shoutboxConfig)
					.set(updateValues)
					.where(
						and(eq(shoutboxConfig.scope, 'room'), eq(shoutboxConfig.roomId, roomId.toString()))
					);
			}
		} catch (error) {
			logger.error('RoomService', 'Error updating room config', { error, roomId });
		}
	}

	/**
	 * Clear room cache
	 */
	private static clearRoomCache(roomId?: RoomId): void {
		if (roomId) {
			this.cache.delete(`room:${roomId}`);
			this.cache.delete(`room-stats:${roomId}`);
		}

		// Clear rooms list cache for all users
		for (const key of this.cache.keys()) {
			if (key.startsWith('rooms-with-stats:')) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Reorder rooms
	 */
	static async reorderRooms(roomOrders: { roomId: RoomId; order: number }[]): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			// Update all room orders in a transaction
			await db.transaction(async (tx) => {
				for (const { roomId, order } of roomOrders) {
					await tx.update(chatRooms).set({ order }).where(eq(chatRooms.id, roomId));
				}
			});

			// Clear cache
			this.clearRoomCache();

			return { success: true, message: 'Room order updated successfully' };
		} catch (error) {
			logger.error('RoomService', 'Error reordering rooms', { error, roomOrders });
			return { success: false, message: 'Failed to update room order' };
		}
	}
}
