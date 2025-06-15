/**
 * Profile Service
 * 
 * Service for handling user profile operations.
 */
import { db } from '@db';
import { users, userInventory, threads, posts, userBadges, userTitles } from '@schema'; // Removed 'products'
import { eq, sql, count } from 'drizzle-orm'; // Removed 'and' and 'InferModel'
// type User = InferModel<typeof users, 'select'>; // Removed as ESLint flagged as unused, Drizzle types are inferred.

// Placeholder for WebSocket event emission - this should be implemented in events.ts or similar
// import { emitProfileUpdateEvent } from './events'; // e.g., server/src/domains/profile/events.ts

export interface ProfileMediaUpdateParams {
  userId: number; // User ID is a number in the database
  mediaType: 'avatar' | 'banner';
  relativePath: string; // Store relative path, not full URL
}

/**
 * Get a user's profile data
 * @param userId The user ID (number, as it is in the database)
 */
export async function getUserProfile(userId: number) { // Changed userId to number
  // Fetch user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId), // users.id is a number column
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
  getUserProfile,

  async updateMediaUrl(params: ProfileMediaUpdateParams): Promise<{ success: boolean; message: string }> {
    const { userId, mediaType, relativePath } = params;

    // relativePath can be an empty string if user is removing avatar/banner.
    // null might be better for DB if a field is truly optional and cleared.
    // For now, an empty string will be stored if provided.
    if (!userId || !mediaType || relativePath === undefined) { 
      throw new Error('Missing parameters for updating media URL. Requires userId, mediaType, and relativePath.');
    }

    let updateField;
    if (mediaType === 'avatar') {
      // Store the relative path. Full URL will be constructed on demand by storageService.getPublicUrl()
      updateField = { avatarUrl: relativePath }; 
    } else if (mediaType === 'banner') {
      updateField = { profileBannerUrl: relativePath }; // Matches field name in getUserProfile
    } else {
      // This should ideally be a more specific error
      throw new Error(`Invalid media type: ${mediaType}. Must be 'avatar' or 'banner'.`);
    }

    try {
      const result = await db.update(users)
        .set(updateField)
        .where(eq(users.id, userId))
        .returning({ updatedId: users.id }); // Ensure the update happened

      if (result.length === 0) {
        console.warn(`User with ID ${userId} not found for media URL update.`);
        // Consider throwing a "User not found" error or returning a specific failure message
        return { success: false, message: `User not found. Couldn't update ${mediaType}.` };
      }
      
      // TODO: Implement WebSocket event emission
      // This should ideally be in a separate event service or handled via a message queue
      // For example: await emitProfileUpdateEvent(userId);
      // console.log(`Profile ${mediaType} updated for user ${userId}. Emitting 'profileUpdated' event (placeholder).`); // Removed console.log


      return { success: true, message: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} updated successfully, you absolute legend!` };

    } catch (error) {
      console.error(`Error updating ${mediaType} URL for user ${userId}:`, error);
      // This should ideally be a more specific error
      throw new Error(`Failed to update ${mediaType} URL. The server gods are displeased.`);
    }
  }
};
