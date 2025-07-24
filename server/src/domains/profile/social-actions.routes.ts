import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { SocialActionsController } from './social-actions.controller';
import { isAuthenticated } from '@api/domains/auth/middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router: RouterType = Router();

/**
 * Social Actions Routes
 * Handles follow, friend, block functionality for enhanced profile system
 */

// All social action routes require authentication
router.use(isAuthenticated);

// POST /api/social/follow - Follow/unfollow user
router.post(
	'/follow',
	rateLimitMiddleware({ windowMs: 60000, max: 20 }), // 20 follow actions per minute
	SocialActionsController.toggleFollow
);

// POST /api/social/friend - Send/accept/decline friend request
router.post(
	'/friend',
	rateLimitMiddleware({ windowMs: 60000, max: 15 }), // 15 friend actions per minute
	SocialActionsController.manageFriendRequest
);

// POST /api/social/block - Block/unblock user
router.post(
	'/block',
	rateLimitMiddleware({ windowMs: 60000, max: 10 }), // 10 block actions per minute
	SocialActionsController.toggleBlock
);

// GET /api/social/relationship/:targetUserId - Get relationship status
router.get(
	'/relationship/:targetUserId',
	rateLimitMiddleware({ windowMs: 60000, max: 60 }), // 60 relationship checks per minute
	SocialActionsController.getRelationshipStatus
);

// GET /api/social/suggestions - Get friend/follow suggestions
router.get(
	'/suggestions',
	rateLimitMiddleware({ windowMs: 300000, max: 10 }), // 10 suggestion requests per 5 minutes
	SocialActionsController.getSocialSuggestions
);

// GET /api/social/pending-requests - Get pending friend requests
router.get(
	'/pending-requests',
	rateLimitMiddleware({ windowMs: 60000, max: 30 }), // 30 requests per minute
	SocialActionsController.getPendingFriendRequests
);

export { router as socialActionsRoutes };

/**
 * Social Actions API Documentation
 *
 * POST /api/social/follow
 * Body: { targetUserId: string }
 * - Toggles follow status with target user
 * - Automatically creates notifications
 * - Returns new relationship state
 *
 * POST /api/social/friend
 * Body: { targetUserId: string, action: 'send' | 'accept' | 'decline' }
 * - Manages friend request lifecycle
 * - Creates bidirectional relationships on acceptance
 * - Sends notifications for all state changes
 *
 * POST /api/social/block
 * Body: { targetUserId: string }
 * - Toggles block status with target user
 * - Removes existing follow/friend relationships
 * - Prevents future interactions
 *
 * GET /api/social/relationship/:targetUserId
 * - Returns comprehensive relationship status
 * - Includes follow, friend, and block states
 * - Bidirectional status checking
 *
 * GET /api/social/suggestions
 * - Returns personalized friend/follow suggestions
 * - Based on mutual connections and activity patterns
 * - Limited to prevent spam
 *
 * GET /api/social/pending-requests
 * - Returns sent and received friend requests
 * - Includes user details for request management
 * - Used for notification badges
 *
 * Rate Limiting Strategy:
 * - Follow/Friend actions: Conservative limits to prevent spam
 * - Relationship checks: Higher limits for UI updates
 * - Suggestions: Very limited to prevent data mining
 *
 * Security Features:
 * - All endpoints require authentication
 * - User cannot perform actions on themselves
 * - Block relationships prevent other interactions
 * - Input validation with Zod schemas
 */
