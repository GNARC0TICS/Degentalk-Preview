/**
 * Social Relationships Routes
 *
 * Defines API routes for user relationships including following, blocking, etc.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { UserId } from '@shared/types/ids';
import { db } from '@db';
import { users, userRelationships } from '@schema';
import { eq, and, sql, desc, not, or, count, gt, isNull } from 'drizzle-orm';
import { isValidId } from '@shared/utils/id';

import { isAuthenticated, isAdminOrModerator, isAdmin } from '../auth/middleware/auth.middleware';
import { getUserIdFromRequest } from '@server-utils/auth';
import { logger } from "../../core/logger";
import { UserTransformer } from '@server/domains/users/transformers/user.transformer';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@core/utils/transformer.helpers';

const router = Router();

// Get followers for a user
router.get('/:userId/followers', async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;

		if (!userId || !isValidId(userId)) {
			return sendErrorResponse(res, 'Valid user ID is required', 400);
		}

		// Get followers
		const followers = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				createdAt: userRelationships.createdAt
			})
			.from(userRelationships)
			.innerJoin(users, eq(users.id, userRelationships.followerId))
			.where(
				and(
					eq(userRelationships.followingId, userId),
					eq(userRelationships.relationshipType, 'follow')
				)
			)
			.orderBy(desc(userRelationships.createdAt));

		res.status(200);
		return sendTransformedListResponse(res, followers, UserTransformer.toPublicUser);
	} catch (error) {
		logger.error('Error fetching followers:', error);
		return sendErrorResponse(res, 'Error fetching followers', 500);
	}
});

// Get following for a user
router.get('/:userId/following', async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;

		if (!userId || !isValidId(userId)) {
			return sendErrorResponse(res, 'Valid user ID is required', 400);
		}

		// Get following
		const following = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				createdAt: userRelationships.createdAt
			})
			.from(userRelationships)
			.innerJoin(users, eq(users.id, userRelationships.followingId))
			.where(
				and(
					eq(userRelationships.followerId, userId),
					eq(userRelationships.relationshipType, 'follow')
				)
			)
			.orderBy(desc(userRelationships.createdAt));

		res.status(200);
		return sendTransformedListResponse(res, following, UserTransformer.toPublicUser);
	} catch (error) {
		logger.error('Error fetching following:', error);
		return sendErrorResponse(res, 'Error fetching following', 500);
	}
});

// Follow a user
router.post('/follow/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;
		const followerId = getUserIdFromRequest(req);

		if (!userId || !isValidId(userId)) {
			return sendErrorResponse(res, 'Valid user ID is required', 400);
		}

		if (followerId === undefined) {
			return sendErrorResponse(res, 'You must be logged in to follow users', 401);
		}

		// Check if already following
		const existingRelationship = await db
			.select()
			.from(userRelationships)
			.where(
				and(
					eq(userRelationships.followerId, followerId),
					eq(userRelationships.followingId, userId),
					eq(userRelationships.relationshipType, 'follow')
				)
			);

		if (existingRelationship.length > 0) {
			return sendErrorResponse(res, 'You are already following this user', 400);
		}

		// Check if user exists
		const userExists = await db
			.select()
			.from(users)
			.where(eq(users.id, userId));

		if (userExists.length === 0) {
			return sendErrorResponse(res, 'User not found', 404);
		}

		// Cannot follow yourself
		if (followerId === userId) {
			return sendErrorResponse(res, 'You cannot follow yourself', 400);
		}

		// Create follow relationship
		const newRelationship = await db
			.insert(userRelationships)
			.values({
				followerId: followerId,
				followingId: userId,
				relationshipType: 'follow',
				isAccepted: true, // follow doesn't need acceptance
				createdAt: new Date()
			})
			.returning();

		res.status(201);
		return sendSuccessResponse(res, { relationship: newRelationship[0] }, 'Successfully followed user');
	} catch (error) {
		logger.error('Error following user:', error);
		return sendErrorResponse(res, 'Error following user', 500);
	}
});

// Unfollow a user
router.delete('/unfollow/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;
		const followerId = getUserIdFromRequest(req);

		if (!userId || !isValidId(userId)) {
			return sendErrorResponse(res, 'Valid user ID is required', 400);
		}

		if (followerId === undefined) {
			return sendErrorResponse(res, 'You must be logged in to unfollow users', 401);
		}

		// Check if relationship exists
		const existingRelationship = await db
			.select()
			.from(userRelationships)
			.where(
				and(
					eq(userRelationships.followerId, followerId),
					eq(userRelationships.followingId, userId),
					eq(userRelationships.relationshipType, 'follow')
				)
			);

		if (existingRelationship.length === 0) {
			return sendErrorResponse(res, 'You are not following this user', 400);
		}

		// Delete relationship
		await db
			.delete(userRelationships)
			.where(
				and(
					eq(userRelationships.followerId, followerId),
					eq(userRelationships.followingId, userId),
					eq(userRelationships.relationshipType, 'follow')
				)
			);

		res.status(200);
		return sendSuccessResponse(res, null, 'Successfully unfollowed user');
	} catch (error) {
		logger.error('Error unfollowing user:', error);
		return sendErrorResponse(res, 'Error unfollowing user', 500);
	}
});

// Check if current user is following a user
router.get('/is-following/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;
		const followerId = getUserIdFromRequest(req);

		if (!userId || !isValidId(userId)) {
			return sendErrorResponse(res, 'Valid user ID is required', 400);
		}

		if (followerId === undefined) {
			return sendErrorResponse(res, 'You must be logged in to check follow status', 401);
		}

		// Check if relationship exists
		const existingRelationship = await db
			.select()
			.from(userRelationships)
			.where(
				and(
					eq(userRelationships.followerId, followerId),
					eq(userRelationships.followingId, userId),
					eq(userRelationships.relationshipType, 'follow')
				)
			);

		res.status(200);
		return sendSuccessResponse(res, { isFollowing: existingRelationship.length > 0 });
	} catch (error) {
		logger.error('Error checking follow status:', error);
		return sendErrorResponse(res, 'Error checking follow status', 500);
	}
});

export default router;
