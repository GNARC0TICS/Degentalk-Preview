import { Router } from 'express'
import type { Router as RouterType, Request, Response, NextFunction, RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { socialController } from './social.controller';
import { eventEmitter } from '@domains/notifications/event-notification-listener';

const router: RouterType = Router();

// Local async handler that emits admin events

const socialAsyncHandler = (
	routeHandler: RequestHandler
): RequestHandler => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
		try {
			await routeHandler(req, res, next);
		} catch (error) {
			// Emit asynchronously to not block response
			setImmediate(() => {
				eventEmitter.emit('admin.route.error', {
					domain: 'users',
					error: error instanceof Error ? {
						message: error.message,
						stack: error.stack,
						name: error.name
					} : String(error),
					timestamp: new Date(),
					userId: req.user?.id || null,
					correlationId,
					path: req.path,
					method: req.method
				});
			});
			next(error);
		}
	};
};

// Validation schemas
const updateSocialConfigSchema = z.object({
	mentions: z
		.object({
			enabled: z.boolean(),
			minLevel: z.number().min(1).max(100),
			allowedRoles: z.array(z.enum(['user', 'moderator', 'admin'])),
			settings: z.object({
				mentionTrigger: z.string().min(1).max(1),
				maxMentionsPerPost: z.number().min(1).max(50),
				maxMentionsPerHour: z.number().min(1).max(1000),
				requireMinLevel: z.boolean(),
				allowFromFriendsOnly: z.boolean(),
				allowFromFollowersOnly: z.boolean(),
				blockFromMutedUsers: z.boolean(),
				enableNotifications: z.boolean(),
				enableEmailNotifications: z.boolean(),
				enableMentionHistory: z.boolean(),
				mentionCooldownSeconds: z.number().min(0).max(3600),
				priorityMentionForMods: z.boolean(),
				crossForumMentions: z.boolean()
			})
		})
		.optional(),
	whaleWatch: z
		.object({
			enabled: z.boolean(),
			minLevel: z.number().min(1).max(100),
			allowedRoles: z.array(z.enum(['user', 'moderator', 'admin'])),
			settings: z.object({
				maxFollowsPerUser: z.number().min(1).max(10000),
				maxFollowsPerHour: z.number().min(1).max(500),
				whaleDetection: z.object({
					minLevel: z.number().min(1).max(100),
					minReputation: z.number().min(0),
					minFollowers: z.number().min(0),
					minThreadsCreated: z.number().min(0),
					minPostsCreated: z.number().min(0)
				}),
				enableFollowNotifications: z.boolean(),
				enableWhaleDigest: z.boolean(),
				digestFrequency: z.enum(['daily', 'weekly', 'monthly']),
				enableActivityFeed: z.boolean(),
				allowPrivateProfiles: z.boolean(),
				requireFollowApproval: z.boolean(),
				showMutualFollows: z.boolean()
			})
		})
		.optional(),
	friends: z
		.object({
			enabled: z.boolean(),
			minLevel: z.number().min(1).max(100),
			allowedRoles: z.array(z.enum(['user', 'moderator', 'admin'])),
			settings: z.object({
				maxFriendsPerUser: z.number().min(1).max(5000),
				maxRequestsPerDay: z.number().min(1).max(100),
				enableFriendGroups: z.boolean(),
				maxFriendGroups: z.number().min(1).max(50),
				enableMutualFriendSuggestions: z.boolean(),
				enableFriendActivityFeed: z.boolean(),
				friendRequestExpireDays: z.number().min(1).max(365),
				enableOnlineStatus: z.boolean(),
				enableLastSeenStatus: z.boolean(),
				autoAcceptMutualFollows: z.boolean(),
				defaultWhisperPermission: z.boolean(),
				defaultProfileViewPermission: z.boolean(),
				defaultActivityViewPermission: z.boolean()
			})
		})
		.optional(),
	adminOverrides: z
		.object({
			bypassAllRateLimits: z.boolean(),
			bypassLevelRequirements: z.boolean(),
			enableDebugMode: z.boolean(),
			forceEnableAllFeatures: z.boolean(),
			logAllSocialActions: z.boolean(),
			enableEmergencyDisable: z.boolean()
		})
		.optional()
});

/**
 * GET /api/admin/social/config
 * Get current social configuration
 */
router.get('/config', socialAsyncHandler(socialController.getSocialConfig));

/**
 * PUT /api/admin/social/config
 * Update social configuration
 */
router.put(
	'/config',
	socialAsyncHandler(async (req, res) => {
		const validatedData = updateSocialConfigSchema.parse(req.body);
		await socialController.updateSocialConfig(req, res, validatedData);
	})
);

/**
 * GET /api/admin/social/stats
 * Get social feature usage statistics
 */
router.get('/stats', socialAsyncHandler(socialController.getSocialStats));

/**
 * POST /api/admin/social/reset
 * Reset social configuration to defaults
 */
router.post('/reset', socialAsyncHandler(socialController.resetSocialConfig));

/**
 * GET /api/admin/social/feature-status
 * Get current status of all social features
 */
router.get('/feature-status', socialAsyncHandler(socialController.getFeatureStatus));

/**
 * POST /api/admin/social/emergency-disable
 * Emergency disable all social features
 */
router.post('/emergency-disable', socialAsyncHandler(socialController.emergencyDisableSocial));

export default router;
