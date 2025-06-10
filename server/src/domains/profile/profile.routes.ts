/**
 * Profile Routes
 *
 * Defines API routes for user profile functionality.
 */

import { Router, Request, Response } from 'express';
import { db } from '@db';
import {
	users,
	userInventory,
	products,
	forumCategories,
	threads,
	posts,
	userRelationships,
	avatarFrames,
	userTitles,
	userBadges
} from '@schema';
import { eq, and, sql, desc, not, or, count, gt, isNull } from 'drizzle-orm';
import signatureRoutes from './signature.routes'; // Import signature routes

// Helper function to get user ID from req.user
function getUserId(req: Request): number {
	if (process.env.NODE_ENV === 'development' && (req.user as any)?.devId) {
		return (req.user as any).devId;
	}
	if (req.user && typeof (req.user as any).id === 'number') {
		return (req.user as any).id;
	}
	console.error('User ID not found in req.user');
	return (req.user as any)?.user_id;
}

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

		// Fetch user data using Drizzle ORM
		const user = await db.query.users.findFirst({
			where: eq(users.username, username),
			with: {
				activeFrame: true, // Eager load active frame
				activeTitle: true, // Eager load active title
				activeBadge: true // Eager load active badge
			}
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const userId = user.id;

		// Fetch user's inventory
		const inventory = await db.query.userInventory.findMany({
			where: eq(userInventory.userId, userId),
			with: {
				product: true
			}
		});

		// Fetch user's badges
		const badges = await db.query.userBadges.findMany({
			where: eq(userBadges.userId, userId),
			with: {
				badge: true
			}
		});

		// Fetch user's titles
		const titles = await db.query.userTitles.findMany({
			where: eq(userTitles.userId, userId),
			with: {
				title: true
			}
		});

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
		console.error('Error fetching profile:', error);
		return res.status(500).json({ message: 'Error fetching profile data' });
	}
});

export default router;
