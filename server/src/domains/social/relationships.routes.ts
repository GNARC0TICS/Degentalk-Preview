/**
 * Social Relationships Routes
 *
 * Defines API routes for user relationships including following, blocking, etc.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { UserId } from '@db/types';
import { db } from '@db';
import { users, userRelationships } from '@schema';
import { eq, and, sql, desc, not, or, count, gt, isNull } from 'drizzle-orm';
import { isValidId } from '@shared/utils/id';

import { isAuthenticated, isAdminOrModerator, isAdmin } from '../auth/middleware/auth.middleware';
import { getUserIdFromRequest } from '@server/src/utils/auth';

const router = Router();

// Get followers for a user
router.get('/:userId/followers', async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;

		if (!userId || !isValidId(userId)) {
			return res.status(400).json({ message: 'Valid user ID is required' });
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

		return res.status(200).json(followers);
	} catch (error) {
		console.error('Error fetching followers:', error);
		return res.status(500).json({ message: 'Error fetching followers' });
	}
});

// Get following for a user
router.get('/:userId/following', async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;

		if (!userId || !isValidId(userId)) {
			return res.status(400).json({ message: 'Valid user ID is required' });
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

		return res.status(200).json(following);
	} catch (error) {
		console.error('Error fetching following:', error);
		return res.status(500).json({ message: 'Error fetching following' });
	}
});

// Follow a user
router.post('/follow/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;
		const followerId = getUserIdFromRequest(req);

		if (!userId || !isValidId(userId)) {
			return res.status(400).json({ message: 'Valid user ID is required' });
		}

		if (followerId === undefined) {
			return res.status(401).json({ message: 'You must be logged in to follow users' });
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
			return res.status(400).json({ message: 'You are already following this user' });
		}

		// Check if user exists
		const userExists = await db
			.select()
			.from(users)
			.where(eq(users.id, userId));

		if (userExists.length === 0) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Cannot follow yourself
		if (followerId === userId) {
			return res.status(400).json({ message: 'You cannot follow yourself' });
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

		return res.status(201).json({
			message: 'Successfully followed user',
			relationship: newRelationship[0]
		});
	} catch (error) {
		console.error('Error following user:', error);
		return res.status(500).json({ message: 'Error following user' });
	}
});

// Unfollow a user
router.delete('/unfollow/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;
		const followerId = getUserIdFromRequest(req);

		if (!userId || !isValidId(userId)) {
			return res.status(400).json({ message: 'Valid user ID is required' });
		}

		if (followerId === undefined) {
			return res.status(401).json({ message: 'You must be logged in to unfollow users' });
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
			return res.status(400).json({ message: 'You are not following this user' });
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

		return res.status(200).json({ message: 'Successfully unfollowed user' });
	} catch (error) {
		console.error('Error unfollowing user:', error);
		return res.status(500).json({ message: 'Error unfollowing user' });
	}
});

// Check if current user is following a user
router.get('/is-following/:userId', isAuthenticated, async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId as UserId;
		const followerId = getUserIdFromRequest(req);

		if (!userId || !isValidId(userId)) {
			return res.status(400).json({ message: 'Valid user ID is required' });
		}

		if (followerId === undefined) {
			return res.status(401).json({ message: 'You must be logged in to check follow status' });
		}

		// Check if relationship exists
		const existingRelationship = await db
			.select()
			.from(userRelationships)
			.where(
				and(
					eq(userRelationships.followerId, followerId),
					eq(userRelationships.followingId, Number(userId)),
					eq(userRelationships.relationshipType, 'follow')
				)
			);

		return res.status(200).json({ isFollowing: existingRelationship.length > 0 });
	} catch (error) {
		console.error('Error checking follow status:', error);
		return res.status(500).json({ message: 'Error checking follow status' });
	}
});

export default router;
