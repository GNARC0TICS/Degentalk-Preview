import { userService } from '@server/src/core/services/user.service';
/**
 * Profile Routes
 *
 * Defines API routes for user profile functionality.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '@db';
import {
	users,
	userInventory,
	products,
	forumStructure,
	threads,
	posts,
	userRelationships,
	avatarFrames,
	userTitles,
	userBadges
} from '@schema';
import { eq, and, sql, desc, not, or, count, gt, isNull } from 'drizzle-orm';
import signatureRoutes from './signature.routes'; // Import signature routes
import { authenticate } from '../../middleware/authenticate';
import { profileService } from './profile.service';
import { referralsService } from './referrals.service';
import { logger } from "../../core/logger";
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

const router = Router();

// Mount signature routes
router.use('/signature', signatureRoutes);

// Get profile data by username
router.get('/:username', async (req: Request, res: Response) => {
	try {
		const { username } = req.params;

		if (!username) {
			return res.status(400).json({ message: 'Username is required' });
		}

		// Fetch user data using simple select (avoiding relational issues)
		const [user] = await db.select().from(users).where(eq(users.username, username));

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const userId = user.id;

		// Fetch user's inventory (simplified)
		const inventory = await db.select().from(userInventory).where(eq(userInventory.userId, userId));

		// Fetch user's badges (simplified)
		const badges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));

		// Fetch user's titles (simplified)
		const titles = await db.select().from(userTitles).where(eq(userTitles.userId, userId));

		// Get thread count
		const threadCountResult = await db
			.select({ value: count() })
			.from(threads)
			.where(eq(threads.userId, userId));
		const totalThreads = threadCountResult[0]?.value || 0;

		// Get post count
		const postCountResult = await db
			.select({ value: count() })
			.from(posts)
			.where(eq(posts.userId, userId));
		const totalPosts = postCountResult[0]?.value || 0;

		// Get total likes received
		const likesResult = await db
			.select({ value: sql<number>`COALESCE(SUM(${posts.likeCount}), 0)` })
			.from(posts)
			.where(eq(posts.userId, userId));
		const totalLikes = likesResult[0]?.value || 0;

		// Get total tips received
		const tipsResult = await db
			.select({ value: sql<number>`COALESCE(SUM(${posts.totalTips}), 0)` })
			.from(posts)
			.where(eq(posts.userId, userId));
		const totalTips = tipsResult[0]?.value || 0;

		// Thread view count
		const viewCountResult = await db
			.select({ value: sql<number>`COALESCE(SUM(${threads.viewCount}), 0)` })
			.from(threads)
			.where(eq(threads.userId, userId));
		const threadViewCount = viewCountResult[0]?.value || 0;

		// Calculate next level XP requirement
		const nextLevelXp = (Number(user.level || 1) + 1) * 1000;

		// Placeholder leaderboard ranks (these would come from a separate ranking system)
		const posterRank = 1;
		const tipperRank = 1;
		const likerRank = 1;

		// Assemble profile data
		const profileData = {
			id: user.id,
			username: user.username,
			avatarUrl: user.avatarUrl,
			role: user.role,
			bio: user.bio,
			signature: user.signature,
			joinedAt: user.createdAt,
			lastActiveAt: user.lastSeenAt,
			email: user.email,
			discordHandle: user.discordHandle,
			twitterHandle: user.twitterHandle,
			website: user.website,
			telegramHandle: user.telegramHandle,
			dgtBalance: user.dgtWalletBalance,
			totalPosts,
			totalThreads,
			totalLikes,
			totalTips,
			clout: user.clout,
			level: user.level,
			xp: user.xp,
			nextLevelXp,
			bannerUrl: user.profileBannerUrl,
			activeFrameId: user.activeFrameId,
			activeFrame: user.activeFrame,
			activeTitleId: user.activeTitleId,
			activeTitle: user.activeTitle,
			activeBadgeId: user.activeBadgeId,
			activeBadge: user.activeBadge,
			badges: badges.map((b) => b.badge),
			titles: titles.map((t) => t.title),
			inventory: inventory.map((item) => ({
				id: item.id,
				productId: item.productId,
				isEquipped: item.equipped,
				productName: item.product.name,
				productType: item.product.category || 'unknown', // Assuming category for productType
				imageUrl: item.product.imageUrl || '',
				rarity: item.product.pluginReward?.rarity || 'common'
			})),
			relationships: {
				friends: [], // TODO: Implement friend relationships
				friendRequestsSent: 0,
				friendRequestsReceived: 0
			},
			stats: {
				threadViewCount,
				posterRank,
				tipperRank,
				likerRank
			}
		};

		return res.status(200).json(profileData);
	} catch (error) {
		logger.error('Error fetching profile:', error);
		return res.status(500).json({ message: 'Error fetching profile data' });
	}
});

sendErrorResponse(res, 'Server error', 401);

sendErrorResponse(res, 'Server error', 401);

sendErrorResponse(res, 'Server error', 401);

export default router;
