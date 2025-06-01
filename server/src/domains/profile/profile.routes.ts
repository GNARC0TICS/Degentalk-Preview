/**
 * Profile Routes
 * 
 * Defines API routes for user profile functionality.
 */

import { Router, Request, Response } from 'express';
import { db } from '../../../db';
import { users, userInventory, products, forumCategories, threads, posts, userRelationships, avatarFrames } from "@shared/schema";
import { eq, and, sql, desc, not, or, count, gt, isNull } from 'drizzle-orm';
import signatureRoutes from './signature.routes'; // Import signature routes

// Helper function to get user ID from req.user
function getUserId(req: Request): number {
  if (req.user && typeof (req.user as any).id === 'number') {
    return (req.user as any).id;
  }
  console.error("User ID not found in req.user");
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
      return res.status(400).json({ message: "Username is required" });
    }
    
    // Check if the user exists with a direct SQL query
    const userCheckResult = await db.execute(
      sql`SELECT user_id FROM users WHERE username = ${username} LIMIT 1`
    );
    
    if (userCheckResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const userId = userCheckResult.rows[0].user_id;
    
    // Get user data with a direct SQL query
    const userDataResult = await db.execute(
      sql`
        SELECT 
          user_id as id,
          username,
          avatar_url as "avatarUrl",
          role,
          bio,
          signature,
          created_at as "joinedAt",
          last_seen_at as "lastActiveAt",
          profile_banner_url as "bannerUrl",
          level,
          xp,
          dgt_wallet_balance as "dgtBalance",
          clout,
          active_frame_id as "activeFrameId",
          avatar_frame_id as "avatarFrameId"
        FROM 
          users
        WHERE 
          user_id = ${userId}
      `
    );
    
    if (userDataResult.rows.length === 0) {
      return res.status(404).json({ message: "User data could not be retrieved" });
    }
    
    // Define user data with proper typing
    interface UserData {
      id: number;
      username: string;
      avatarUrl: string | null;
      role: string;
      bio: string | null;
      signature: string | null;
      joinedAt: string;
      lastActiveAt: string | null;
      bannerUrl: string | null;
      level: number;
      xp: number;
      dgtBalance: number;
      clout: number;
      activeFrameId: number | null;
      avatarFrameId: number | null;
    }
    
    const userData = userDataResult.rows[0] as unknown as UserData;
    
    // Get active frame if any
    let activeFrame = null;
    
    // Check if avatar_frames table exists before querying it
    // Now that we have avatar_frame_id column, we can query it
    if (userData.avatarFrameId) {
      const frameDataResult = await db.execute(
        sql`
          SELECT 
            id,
            name,
            image_url as "imageUrl",
            rarity
          FROM 
            avatar_frames
          WHERE 
            id = ${userData.avatarFrameId}
          LIMIT 1
        `
      );
      
      if (frameDataResult.rows.length > 0) {
        // Extract frame data from avatar_frames
        activeFrame = frameDataResult.rows[0];
      }
    }
    
    // Use active_frame_id for now
    if (userData.activeFrameId) {
      const frameDataResult = await db.execute(
        sql`
          SELECT 
            product_id as id,
            plugin_reward->>'name' as name,
            plugin_reward->>'type' as type
          FROM 
            products
          WHERE 
            product_id = ${userData.activeFrameId}
          LIMIT 1
        `
      );
      
      if (frameDataResult.rows.length > 0) {
        // Extract frame data from product
        const frameProduct = frameDataResult.rows[0];
        activeFrame = {
          id: frameProduct.id,
          name: frameProduct.name || 'Unknown Frame',
          imageUrl: `/api/images/frames/${frameProduct.type || 'default.png'}`,
          rarity: 'common' // Default rarity
        };
      }
    }
    
    // Get thread count
    const threadCountResult = await db.execute(
      sql`SELECT COUNT(*) as value FROM threads WHERE user_id = ${userId}`
    );
    const threadCount = [{ value: Number(threadCountResult.rows[0].value) || 0 }];
    
    // Get post count
    const postCountResult = await db.execute(
      sql`SELECT COUNT(*) as value FROM posts WHERE user_id = ${userId}`
    );
    const postCount = [{ value: Number(postCountResult.rows[0].value) || 0 }];
    
    // Get total likes received
    const likesResult = await db.execute(
      sql`SELECT COALESCE(SUM(like_count), 0) as value FROM posts WHERE user_id = ${userId}`
    );
    const likesCount = [{ value: Number(likesResult.rows[0].value) || 0 }];
    
    // Get total tips received
    const tipsResult = await db.execute(
      sql`SELECT COALESCE(SUM(total_tips), 0) as value FROM posts WHERE user_id = ${userId}`
    );
    const tipsCount = [{ value: Number(tipsResult.rows[0].value) || 0 }];
    
    // We'll skip inventory for now
    const userItems: { 
      id: number; 
      productId: number; 
      isEquipped: boolean; 
      productName: string; 
      productType: string;
      imageUrl: string;
      rarity: string;
    }[] = [];
    
    // Simplified user relationships for now
    const friends: { id: number; username: string; avatarUrl: string | null }[] = [];
    const sentRequests = [{ value: 0 }];
    const receivedRequests = [{ value: 0 }];
    
    // Thread view count
    const viewCountResult = await db.execute(
      sql`SELECT COALESCE(SUM(view_count), 0) as value FROM threads WHERE user_id = ${userId}`
    );
    const threadViewCount = [{ value: Number(viewCountResult.rows[0].value) || 0 }];
    
    // Calculate next level XP requirement
    const nextLevelXp = (Number(userData.level || 1) + 1) * 1000;
    
    // Placeholder leaderboard ranks
    const posterRank = [{ value: 1 }];
    const tipperRank = [{ value: 1 }];
    const likerRank = [{ value: 1 }];
    
    // Assemble profile data
    const profileData = {
      id: userData.id,
      username: userData.username,
      avatarUrl: userData.avatarUrl,
      role: userData.role,
      bio: userData.bio,
      signature: userData.signature,
      joinedAt: userData.joinedAt,
      lastActiveAt: userData.lastActiveAt,
      dgtBalance: userData.dgtBalance,
      totalPosts: postCount[0].value,
      totalThreads: threadCount[0].value,
      totalLikes: likesCount[0].value,
      totalTips: tipsCount[0].value,
      clout: userData.clout,
      level: userData.level,
      xp: userData.xp,
      nextLevelXp,
      bannerUrl: userData.bannerUrl,
      activeFrameId: userData.activeFrameId,
      avatarFrameId: userData.avatarFrameId,
      activeFrame,
      inventory: userItems,
      relationships: {
        friends,
        friendRequestsSent: sentRequests[0].value,
        friendRequestsReceived: receivedRequests[0].value
      },
      stats: {
        threadViewCount: threadViewCount[0].value,
        posterRank: posterRank[0].value,
        tipperRank: tipperRank[0].value,
        likerRank: likerRank[0].value
      }
    };
    
    return res.status(200).json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: "Error fetching profile data" });
  }
});

export default router; 