import { db } from '@degentalk/db';
import { users, userRelationships, notifications } from '@schema';
import { eq, and, or } from 'drizzle-orm';
import { logger } from '@core/logger';

export type RelationshipType = 'follow' | 'friend' | 'block';
export type RelationshipStatus = 'pending' | 'accepted' | 'declined';

export interface SocialActionResult {
	success: boolean;
	action: string;
	relationship?: any;
	message: string;
}

export class SocialActionsService {
	/**
	 * Follow or unfollow a user
	 */
	static async toggleFollow(userId: string, targetUserId: string): Promise<SocialActionResult> {
		try {
			if (userId === targetUserId) {
				return {
					success: false,
					action: 'follow',
					message: 'Cannot follow yourself'
				};
			}

			// Check if already following
			const existingFollow = await db
				.select()
				.from(userRelationships)
				.where(
					and(
						eq(userRelationships.userId, userId),
						eq(userRelationships.targetUserId, targetUserId),
						eq(userRelationships.type, 'follow')
					)
				)
				.limit(1);

			if (existingFollow.length > 0) {
				// Unfollow
				await db
					.delete(userRelationships)
					.where(
						and(
							eq(userRelationships.userId, userId),
							eq(userRelationships.targetUserId, targetUserId),
							eq(userRelationships.type, 'follow')
						)
					);

				return {
					success: true,
					action: 'unfollow',
					message: 'Successfully unfollowed user'
				};
			} else {
				// Follow
				const relationship = await db
					.insert(userRelationships)
					.values({
						userId,
						targetUserId,
						type: 'follow',
						status: 'accepted', // Follows are automatically accepted
						createdAt: new Date()
					})
					.returning();

				// Create notification for target user
				await this.createNotification(targetUserId, 'follow', `You have a new follower`, {
					followerId: userId
				});

				// Update follower counts (optional - can be done async)
				await this.updateFollowerCounts(userId, targetUserId);

				return {
					success: true,
					action: 'follow',
					relationship: relationship[0],
					message: 'Successfully followed user'
				};
			}
		} catch (error) {
			logger.error('Error toggling follow:', error);
			return {
				success: false,
				action: 'follow',
				message: 'Failed to update follow status'
			};
		}
	}

	/**
	 * Send, accept, or decline friend request
	 */
	static async manageFriendRequest(
		userId: string,
		targetUserId: string,
		action: 'send' | 'accept' | 'decline'
	): Promise<SocialActionResult> {
		try {
			if (userId === targetUserId) {
				return {
					success: false,
					action: 'friend',
					message: 'Cannot send friend request to yourself'
				};
			}

			const existingRelationship = await db
				.select()
				.from(userRelationships)
				.where(
					and(
						or(
							and(
								eq(userRelationships.userId, userId),
								eq(userRelationships.targetUserId, targetUserId)
							),
							and(
								eq(userRelationships.userId, targetUserId),
								eq(userRelationships.targetUserId, userId)
							)
						),
						eq(userRelationships.type, 'friend')
					)
				)
				.limit(1);

			switch (action) {
				case 'send':
					if (existingRelationship.length > 0) {
						const rel = existingRelationship[0];
						if (rel.status === 'accepted') {
							return {
								success: false,
								action: 'friend',
								message: 'Already friends with this user'
							};
						} else if (rel.status === 'pending') {
							return {
								success: false,
								action: 'friend',
								message: 'Friend request already sent'
							};
						}
					}

					// Send friend request
					const friendRequest = await db
						.insert(userRelationships)
						.values({
							userId,
							targetUserId,
							type: 'friend',
							status: 'pending',
							createdAt: new Date()
						})
						.returning();

					// Create notification
					await this.createNotification(
						targetUserId,
						'friend_request',
						`You have a new friend request`,
						{ senderId: userId }
					);

					return {
						success: true,
						action: 'friend_request_sent',
						relationship: friendRequest[0],
						message: 'Friend request sent successfully'
					};

				case 'accept':
					if (existingRelationship.length === 0) {
						return {
							success: false,
							action: 'friend',
							message: 'No friend request found'
						};
					}

					const relationship = existingRelationship[0];
					if (relationship.targetUserId !== userId) {
						return {
							success: false,
							action: 'friend',
							message: 'Cannot accept your own friend request'
						};
					}

					// Accept friend request
					await db
						.update(userRelationships)
						.set({
							status: 'accepted',
							updatedAt: new Date()
						})
						.where(eq(userRelationships.id, relationship.id));

					// Create reverse relationship for mutual friendship
					await db.insert(userRelationships).values({
						userId,
						targetUserId: relationship.userId,
						type: 'friend',
						status: 'accepted',
						createdAt: new Date()
					});

					// Notify requester that request was accepted
					await this.createNotification(
						relationship.userId,
						'friend_accepted',
						`Your friend request was accepted`,
						{ accepterId: userId }
					);

					return {
						success: true,
						action: 'friend_accepted',
						message: 'Friend request accepted'
					};

				case 'decline':
					if (existingRelationship.length === 0) {
						return {
							success: false,
							action: 'friend',
							message: 'No friend request found'
						};
					}

					// Delete the friend request
					await db
						.delete(userRelationships)
						.where(eq(userRelationships.id, existingRelationship[0].id));

					return {
						success: true,
						action: 'friend_declined',
						message: 'Friend request declined'
					};

				default:
					return {
						success: false,
						action: 'friend',
						message: 'Invalid action'
					};
			}
		} catch (error) {
			logger.error('Error managing friend request:', error);
			return {
				success: false,
				action: 'friend',
				message: 'Failed to manage friend request'
			};
		}
	}

	/**
	 * Block or unblock a user
	 */
	static async toggleBlock(userId: string, targetUserId: string): Promise<SocialActionResult> {
		try {
			if (userId === targetUserId) {
				return {
					success: false,
					action: 'block',
					message: 'Cannot block yourself'
				};
			}

			// Check if already blocked
			const existingBlock = await db
				.select()
				.from(userRelationships)
				.where(
					and(
						eq(userRelationships.userId, userId),
						eq(userRelationships.targetUserId, targetUserId),
						eq(userRelationships.type, 'block')
					)
				)
				.limit(1);

			if (existingBlock.length > 0) {
				// Unblock
				await db.delete(userRelationships).where(eq(userRelationships.id, existingBlock[0].id));

				return {
					success: true,
					action: 'unblock',
					message: 'User unblocked successfully'
				};
			} else {
				// Block user - first remove any existing relationships
				await db
					.delete(userRelationships)
					.where(
						and(
							or(
								and(
									eq(userRelationships.userId, userId),
									eq(userRelationships.targetUserId, targetUserId)
								),
								and(
									eq(userRelationships.userId, targetUserId),
									eq(userRelationships.targetUserId, userId)
								)
							),
							or(eq(userRelationships.type, 'follow'), eq(userRelationships.type, 'friend'))
						)
					);

				// Create block relationship
				const blockRelationship = await db
					.insert(userRelationships)
					.values({
						userId,
						targetUserId,
						type: 'block',
						status: 'accepted',
						createdAt: new Date()
					})
					.returning();

				return {
					success: true,
					action: 'block',
					relationship: blockRelationship[0],
					message: 'User blocked successfully'
				};
			}
		} catch (error) {
			logger.error('Error toggling block:', error);
			return {
				success: false,
				action: 'block',
				message: 'Failed to update block status'
			};
		}
	}

	/**
	 * Get relationship status between two users
	 */
	static async getRelationshipStatus(userId: string, targetUserId: string) {
		try {
			const relationships = await db
				.select()
				.from(userRelationships)
				.where(
					or(
						and(
							eq(userRelationships.userId, userId),
							eq(userRelationships.targetUserId, targetUserId)
						),
						and(
							eq(userRelationships.userId, targetUserId),
							eq(userRelationships.targetUserId, userId)
						)
					)
				);

			const status = {
				isFollowing: false,
				isFollowedBy: false,
				isFriend: false,
				friendRequestSent: false,
				friendRequestReceived: false,
				isBlocked: false,
				isBlockedBy: false
			};

			relationships.forEach((rel) => {
				if (rel.userId === userId && rel.targetUserId === targetUserId) {
					// Current user to target user
					switch (rel.type) {
						case 'follow':
							status.isFollowing = true;
							break;
						case 'friend':
							if (rel.status === 'accepted') status.isFriend = true;
							if (rel.status === 'pending') status.friendRequestSent = true;
							break;
						case 'block':
							status.isBlocked = true;
							break;
					}
				} else if (rel.userId === targetUserId && rel.targetUserId === userId) {
					// Target user to current user
					switch (rel.type) {
						case 'follow':
							status.isFollowedBy = true;
							break;
						case 'friend':
							if (rel.status === 'accepted') status.isFriend = true;
							if (rel.status === 'pending') status.friendRequestReceived = true;
							break;
						case 'block':
							status.isBlockedBy = true;
							break;
					}
				}
			});

			return status;
		} catch (error) {
			logger.error('Error getting relationship status:', error);
			throw new Error('Failed to get relationship status');
		}
	}

	/**
	 * Create notification for user
	 */
	private static async createNotification(
		userId: string,
		type: string,
		message: string,
		metadata: any = {}
	) {
		try {
			await db.insert(notifications).values({
				userId,
				type,
				message,
				metadata: JSON.stringify(metadata),
				isRead: false,
				createdAt: new Date()
			});
		} catch (error) {
			logger.error('Error creating notification:', error);
			// Don't throw - notifications are non-critical
		}
	}

	/**
	 * Update follower counts in user stats (can be done async)
	 */
	private static async updateFollowerCounts(followerId: string, targetId: string) {
		try {
			// This could be implemented as a background job
			// For now, just log the action
			logger.info(`Follower count update needed: ${followerId} -> ${targetId}`);
		} catch (error) {
			logger.error('Error updating follower counts:', error);
		}
	}
}
