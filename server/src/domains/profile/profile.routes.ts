import { userService } from '@core/services/user.service';
/**
 * Profile Routes
 *
 * Defines API routes for user profile functionality.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import type { Request, Response } from 'express';
import { db } from '@degentalk/db';
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
	userBadges,
	titles,
	badges
} from '@schema';
import { eq, and, sql, desc, not, or, count, gt, isNull } from 'drizzle-orm';
import signatureRoutes from './signature.routes'; // Import signature routes
import { luciaAuth } from '@middleware/lucia-auth.middleware';
const isAuthenticated = luciaAuth.require;
import { profileService } from './profile.service';
import { referralsService } from './referrals.service';
import { logger } from '@core/logger';
import { sendSuccess, errorResponses } from '@utils/api-responses';

const router: RouterType = Router();

// Mount signature routes
router.use('/signature', signatureRoutes);

// Get profile data by username
router.get('/:username', async (req: Request, res: Response) => {
	try {
		const { username } = req.params;

		if (!username) {
			return errorResponses.validationError(res, 'Username is required');
		}

		// Fetch user data using simple select (avoiding relational issues)
		const [user] = await db.select().from(users).where(eq(users.username, username));

		if (!user) {
			return errorResponses.notFound(res, 'User not found');
		}

		const userId = user.id;

		// Fetch user's inventory with product data
		const inventoryRecords = await db
			.select({
				inventory: userInventory,
				product: products
			})
			.from(userInventory)
			.innerJoin(products, eq(userInventory.productId, products.id))
			.where(eq(userInventory.userId, userId));

		// Fetch user's badges with badge data
		const userBadgeRecords = await db
			.select({
				userBadge: userBadges,
				badge: badges
			})
			.from(userBadges)
			.innerJoin(badges, eq(userBadges.badgeId, badges.id))
			.where(eq(userBadges.userId, userId));

		// Fetch user's titles with title data
		const userTitleRecords = await db
			.select({
				userTitle: userTitles,
				title: titles
			})
			.from(userTitles)
			.innerJoin(titles, eq(userTitles.titleId, titles.id))
			.where(eq(userTitles.userId, userId));

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

		// Assemble profile data following the User type structure with forumStats
		const profileData = {
			id: user.id,
			username: user.username,
			avatarUrl: user.avatarUrl,
			activeAvatarUrl: user.avatarUrl, // TODO: Apply frame if activeFrameId exists
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
			// Add forumStats to match User type structure
			forumStats: {
				level: user.level,
				xp: user.xp,
				reputation: user.reputation,
				totalPosts,
				totalThreads,
				totalLikes,
				totalTips
			},
			// Keep flat properties for backward compatibility
			totalPosts,
			totalThreads,
			totalLikes,
			totalTips,
			reputation: user.reputation,
			level: user.level,
			xp: user.xp,
			nextLevelXp,
			bannerUrl: user.profileBannerUrl,
			activeFrameId: user.activeFrameId,
			activeFrame: user.activeFrame,
			activeTitleId: user.activeTitleId,
			activeTitle: user.activeTitleId ? 
				userTitleRecords.find(r => r.title.id === user.activeTitleId)?.title || null : 
				null,
			activeBadgeId: user.activeBadgeId,
			activeBadge: user.activeBadge,
			badges: userBadgeRecords.map((record) => record.badge),
			titles: userTitleRecords.map((record) => record.title),
			inventory: inventoryRecords.map((record) => ({
				id: record.inventory.id,
				userId: user.id,
				productId: record.inventory.productId,
				isEquipped: record.inventory.equipped,
				productName: record.product.name,
				productType: record.product.category || 'unknown',
				imageUrl: record.product.imageUrl || '',
				rarity: record.product.pluginReward?.rarity || 'common'
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

		return sendSuccess(res, profileData);
	} catch (error) {
		logger.error('Error fetching profile:', error);
		return errorResponses.internalError(res, 'Error fetching profile data');
	}
});

export default router;
