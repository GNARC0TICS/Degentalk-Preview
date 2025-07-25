import { db } from '@db';
import {
	friendships,
	userFriendPreferences,
	friendGroups,
	friendGroupMembers,
	users
} from '@schema';
import { eq, and, desc, sql, count, inArray, or } from 'drizzle-orm';
import type { RequestId } from '@shared/types/ids';

export class FriendsService {
	/**
	 * Send a friend request
	 */
	static async sendFriendRequest({
		requesterId,
		addresseeId,
		message = ''
	}: {
		requesterId: string;
		addresseeId: string;
		message?: string;
	}) {
		// Prevent self-friending
		if (requesterId === addresseeId) {
			throw new Error('Cannot send friend request to yourself');
		}

		// Check if friendship already exists
		const existingFriendship = await db
			.select()
			.from(friendships)
			.where(
				or(
					and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
					and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId))
				)
			)
			.limit(1);

		if (existingFriendship.length > 0) {
			const existing = existingFriendship[0];
			if (existing.status === 'accepted') {
				throw new Error('Already friends with this user');
			} else if (existing.status === 'pending') {
				throw new Error('Friend request already pending');
			} else if (existing.status === 'blocked') {
				throw new Error('Cannot send friend request to this user');
			}
		}

		// Check addressee's friend preferences
		const addresseePrefs = await this.getUserFriendPreferences(addresseeId);

		if (!addresseePrefs.allowAllFriendRequests) {
			if (addresseePrefs.onlyMutualsCanRequest) {
				// Check if they follow each other (implement when follows service is available)
				// const areMutuals = await FollowsService.areMutualFollows(requesterId, addresseeId);
				// if (!areMutuals) throw new Error('Only mutual followers can send friend requests');
			}
		}

		// Create friend request
		const request = await db
			.insert(friendships)
			.values({
				requesterId,
				addresseeId,
				status: 'pending',
				requestMessage: message,
				allowWhispers: addresseePrefs.defaultAllowWhispers,
				allowProfileView: addresseePrefs.defaultAllowProfileView,
				allowActivityView: addresseePrefs.defaultAllowActivityView
			})
			.returning();

		return request[0];
	}

	/**
	 * Respond to a friend request
	 */
	static async respondToFriendRequest(
		requestId: RequestId,
		response: 'accept' | 'decline' | 'block'
	) {
		// Get the request
		const request = await db
			.select()
			.from(friendships)
			.where(eq(friendships.id, requestId))
			.limit(1);

		if (request.length === 0) {
			throw new Error('Friend request not found');
		}

		const requestData = request[0];

		if (requestData.status !== 'pending') {
			throw new Error('Friend request already responded to');
		}

		let newStatus: 'accepted' | 'blocked';
		if (response === 'accept') {
			newStatus = 'accepted';
		} else if (response === 'block') {
			newStatus = 'blocked';
		} else {
			// Decline - delete the request
			await db.delete(friendships).where(eq(friendships.id, requestId));
			return { action: 'declined', requestData };
		}

		// Update the request
		const updated = await db
			.update(friendships)
			.set({
				status: newStatus,
				respondedAt: sql`NOW()`,
				updatedAt: sql`NOW()`
			})
			.where(eq(friendships.id, requestId))
			.returning();

		return { action: response, friendship: updated[0] };
	}

	/**
	 * Remove a friend (unfriend)
	 */
	static async removeFriend(userId: string, friendId: string) {
		const result = await db
			.delete(friendships)
			.where(
				or(
					and(
						eq(friendships.requesterId, userId),
						eq(friendships.addresseeId, friendId),
						eq(friendships.status, 'accepted')
					),
					and(
						eq(friendships.requesterId, friendId),
						eq(friendships.addresseeId, userId),
						eq(friendships.status, 'accepted')
					)
				)
			)
			.returning();

		if (result.length === 0) {
			throw new Error('Friendship not found');
		}

		return result[0];
	}

	/**
	 * Check if two users are friends
	 */
	static async areFriends(userId1: string, userId2: string): Promise<boolean> {
		const result = await db
			.select({ id: friendships.id })
			.from(friendships)
			.where(
				and(
					or(
						and(eq(friendships.requesterId, userId1), eq(friendships.addresseeId, userId2)),
						and(eq(friendships.requesterId, userId2), eq(friendships.addresseeId, userId1))
					),
					eq(friendships.status, 'accepted')
				)
			)
			.limit(1);

		return result.length > 0;
	}

	/**
	 * Get user's friends list
	 */
	static async getUserFriends(userId: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;

		const friends = await db
			.select({
				id: friendships.id,
				friendedAt: friendships.respondedAt,
				permissions: {
					allowWhispers: friendships.allowWhispers,
					allowProfileView: friendships.allowProfileView,
					allowActivityView: friendships.allowActivityView
				},
				friend: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					level: users.level,
					role: users.role,
					reputation: users.reputation
				}
			})
			.from(friendships)
			.leftJoin(
				users,
				or(
					and(eq(friendships.requesterId, userId), eq(users.id, friendships.addresseeId)),
					and(eq(friendships.addresseeId, userId), eq(users.id, friendships.requesterId))
				)
			)
			.where(
				and(
					or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
					eq(friendships.status, 'accepted')
				)
			)
			.orderBy(desc(friendships.respondedAt))
			.limit(limit)
			.offset(offset);

		return friends;
	}

	/**
	 * Get incoming friend requests
	 */
	static async getIncomingFriendRequests(userId: string) {
		const requests = await db
			.select({
				id: friendships.id,
				requestMessage: friendships.requestMessage,
				createdAt: friendships.createdAt,
				requester: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					level: users.level,
					role: users.role
				}
			})
			.from(friendships)
			.leftJoin(users, eq(friendships.requesterId, users.id))
			.where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')))
			.orderBy(desc(friendships.createdAt));

		return requests;
	}

	/**
	 * Get outgoing friend requests
	 */
	static async getOutgoingFriendRequests(userId: string) {
		const requests = await db
			.select({
				id: friendships.id,
				requestMessage: friendships.requestMessage,
				createdAt: friendships.createdAt,
				addressee: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					activeAvatarUrl: users.activeAvatarUrl,
					level: users.level,
					role: users.role
				}
			})
			.from(friendships)
			.leftJoin(users, eq(friendships.addresseeId, users.id))
			.where(and(eq(friendships.requesterId, userId), eq(friendships.status, 'pending')))
			.orderBy(desc(friendships.createdAt));

		return requests;
	}

	/**
	 * Get friend counts
	 */
	static async getFriendCounts(userId: string) {
		const friendCount = await db
			.select({ count: count() })
			.from(friendships)
			.where(
				and(
					or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
					eq(friendships.status, 'accepted')
				)
			);

		const incomingRequestCount = await db
			.select({ count: count() })
			.from(friendships)
			.where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')));

		return {
			friends: friendCount[0]?.count || 0,
			incomingRequests: incomingRequestCount[0]?.count || 0
		};
	}

	/**
	 * Get user's friend preferences
	 */
	static async getUserFriendPreferences(userId: string) {
		const preferences = await db
			.select()
			.from(userFriendPreferences)
			.where(eq(userFriendPreferences.userId, userId))
			.limit(1);

		// Return default preferences if none exist
		if (preferences.length === 0) {
			return {
				allowAllFriendRequests: true,
				onlyMutualsCanRequest: false,
				requireMinLevel: false,
				minLevelRequired: 1,
				autoAcceptFromFollowers: false,
				autoAcceptFromWhales: false,
				hideFriendsList: false,
				hideFriendCount: false,
				showOnlineStatus: true,
				notifyOnFriendRequest: true,
				notifyOnFriendAccept: true,
				emailOnFriendRequest: false,
				defaultAllowWhispers: true,
				defaultAllowProfileView: true,
				defaultAllowActivityView: true
			};
		}

		return preferences[0];
	}

	/**
	 * Update user's friend preferences
	 */
	static async updateUserFriendPreferences(userId: string, preferences: Partial<any>) {
		const existingPrefs = await db
			.select()
			.from(userFriendPreferences)
			.where(eq(userFriendPreferences.userId, userId))
			.limit(1);

		if (existingPrefs.length === 0) {
			// Create new preferences
			return await db
				.insert(userFriendPreferences)
				.values({
					userId,
					...preferences
				})
				.returning();
		} else {
			// Update existing preferences
			return await db
				.update(userFriendPreferences)
				.set({
					...preferences,
					updatedAt: sql`NOW()`
				})
				.where(eq(userFriendPreferences.userId, userId))
				.returning();
		}
	}

	/**
	 * Update friendship permissions
	 */
	static async updateFriendshipPermissions(
		userId: string,
		friendId: string,
		permissions: {
			allowWhispers?: boolean;
			allowProfileView?: boolean;
			allowActivityView?: boolean;
		}
	) {
		const result = await db
			.update(friendships)
			.set({
				...permissions,
				updatedAt: sql`NOW()`
			})
			.where(
				or(
					and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, friendId)),
					and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, userId))
				)
			)
			.returning();

		if (result.length === 0) {
			throw new Error('Friendship not found');
		}

		return result[0];
	}

	/**
	 * Check if user can send whisper to another user
	 */
	static async canSendWhisper(senderId: string, recipientId: string): Promise<boolean> {
		// Check if they are friends
		const friendship = await db
			.select({
				allowWhispers: friendships.allowWhispers
			})
			.from(friendships)
			.where(
				and(
					or(
						and(eq(friendships.requesterId, senderId), eq(friendships.addresseeId, recipientId)),
						and(eq(friendships.requesterId, recipientId), eq(friendships.addresseeId, senderId))
					),
					eq(friendships.status, 'accepted')
				)
			)
			.limit(1);

		// If they're friends, check whisper permission
		if (friendship.length > 0) {
			return friendship[0].allowWhispers;
		}

		// If not friends, check recipient's preferences
		const recipientPrefs = await this.getUserFriendPreferences(recipientId);

		// For now, allow whispers from non-friends
		// This can be changed to enforce friends-only whispers
		return true;
	}

	/**
	 * Search users for friend requests
	 */
	static async searchUsersForFriends(query: string, currentUserId: string, limit = 10) {
		if (query.length < 1) return [];

		const searchResults = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level,
				role: users.role,
				reputation: users.reputation,
				friendshipStatus: sql<string | null>`
					CASE 
						WHEN ${friendships.status} = 'accepted' THEN 'friends'
						WHEN ${friendships.status} = 'pending' AND ${friendships.requesterId} = ${currentUserId} THEN 'request_sent'
						WHEN ${friendships.status} = 'pending' AND ${friendships.addresseeId} = ${currentUserId} THEN 'request_received'
						WHEN ${friendships.status} = 'blocked' THEN 'blocked'
						ELSE NULL
					END
				`.as('friendshipStatus')
			})
			.from(users)
			.leftJoin(
				friendships,
				or(
					and(eq(friendships.requesterId, currentUserId), eq(friendships.addresseeId, users.id)),
					and(eq(friendships.requesterId, users.id), eq(friendships.addresseeId, currentUserId))
				)
			)
			.where(
				and(
					sql`LOWER(${users.username}) LIKE LOWER(${`%${query}%`})`,
					sql`${users.id} != ${currentUserId}` // Exclude current user
				)
			)
			.orderBy(users.username)
			.limit(limit);

		return searchResults;
	}

	/**
	 * Get mutual friends between two users
	 */
	static async getMutualFriends(userId1: string, userId2: string) {
		// This is a complex query that finds users who are friends with both userId1 and userId2
		const mutualFriends = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				activeAvatarUrl: users.activeAvatarUrl,
				level: users.level
			})
			.from(users)
			.where(
				sql`
					${users.id} IN (
						SELECT CASE 
							WHEN ${friendships.requesterId} = ${userId1} THEN ${friendships.addresseeId}
							ELSE ${friendships.requesterId}
						END as friend_id
						FROM ${friendships}
						WHERE (${friendships.requesterId} = ${userId1} OR ${friendships.addresseeId} = ${userId1})
						AND ${friendships.status} = 'accepted'
					)
					AND ${users.id} IN (
						SELECT CASE 
							WHEN ${friendships.requesterId} = ${userId2} THEN ${friendships.addresseeId}
							ELSE ${friendships.requesterId}
						END as friend_id
						FROM ${friendships}
						WHERE (${friendships.requesterId} = ${userId2} OR ${friendships.addresseeId} = ${userId2})
						AND ${friendships.status} = 'accepted'
					)
				`
			)
			.orderBy(users.username);

		return mutualFriends;
	}
}
