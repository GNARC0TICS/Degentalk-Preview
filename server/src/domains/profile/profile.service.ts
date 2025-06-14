/**
 * Profile Service
 * 
 * Service for handling user profile operations.
 */
import { db } from '@db';
import { users, userInventory, products, threads, posts, userBadges, userTitles } from '@schema';
import { eq, and, sql, count } from 'drizzle-orm';
import type { User } from '@schema';

/**
 * Get a user's profile data
 * @param userId The user ID
 */
export async function getUserProfile(userId: string) {
  // Fetch user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      activeFrame: true,
      activeTitle: true,
      activeBadge: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

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
  return {
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
      productType: item.product.category || 'unknown',
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
}

export const profileService = {
  getUserProfile
}; 