import { Request, Response } from 'express';
import { z } from 'zod';
import { adServingService } from './ad-serving.service';
import { campaignManagementService } from './campaign-management.service';
import { adConfigurationService } from './ad-configuration.service';

// Request validation schemas
const adRequestSchema = z.object({
	placementSlug: z.string(),
	userHash: z.string().optional(),
	sessionId: z.string(),
	forumSlug: z.string().optional(),
	threadId: z.string().uuid().optional(),
	deviceInfo: z.object({
		type: z.enum(['mobile', 'desktop', 'tablet']),
		screenSize: z.string(),
		userAgent: z.string()
	}),
	geoData: z.object({
		region: z.string(),
		timezone: z.string()
	}),
	userContext: z.object({
		dgtBalanceTier: z.string().optional(),
		xpLevel: z.number().optional(),
		interestSegments: z.array(z.string()).optional(),
		activityLevel: z.string().optional()
	})
});

const createCampaignSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	type: z.enum([
		'display_banner',
		'sponsored_thread',
		'forum_spotlight',
		'user_reward',
		'native_content'
	]),
	totalBudget: z.number().positive(),
	dailyBudget: z.number().positive().optional(),
	paymentMethod: z.enum(['dgt_tokens', 'usdt', 'bitcoin', 'ethereum', 'stripe']),
	pricingModel: z.enum(['CPM', 'CPC', 'CPA', 'FLAT']),
	bidAmount: z.number().positive(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	targetingRules: z.object({}).passthrough(),
	placementRules: z.object({}).passthrough(),
	frequencyCap: z.object({}).passthrough(),
	creativeAssets: z.array(z.object({}).passthrough()),
	optimizationGoal: z.string().optional()
});

const trackingEventSchema = z.object({
	campaign: z.string().uuid(),
	placement: z.string().uuid(),
	session: z.string(),
	eventType: z.enum(['impression', 'click', 'conversion']),
	metadata: z.object({}).passthrough().optional()
});

/**
 * Ad Controller
 * Handles ad serving, campaign management, and tracking endpoints
 */
export class AdController {
	/**
	 * Serve an ad for a specific placement
	 * GET /api/ads/serve?placement=header_banner&...
	 */
	async serveAd(req: Request, res: Response): Promise<void> {
		try {
			const adRequest = adRequestSchema.parse({
				placementSlug: req.query.placement,
				userHash: req.query.userHash,
				sessionId: req.query.sessionId || req.sessionID,
				forumSlug: req.query.forumSlug,
				threadId: req.query.threadId,
				deviceInfo: {
					type: this.getDeviceType(req.headers['user-agent'] || ''),
					screenSize: req.query.screenSize || 'unknown',
					userAgent: req.headers['user-agent'] || ''
				},
				geoData: {
					region: req.query.region || 'unknown',
					timezone: req.query.timezone || 'UTC'
				},
				userContext: {
					dgtBalanceTier: req.query.dgtBalanceTier,
					xpLevel: req.query.xpLevel ? parseInt(req.query.xpLevel as string) : undefined,
					interestSegments: req.query.interestSegments
						? (req.query.interestSegments as string).split(',')
						: undefined,
					activityLevel: req.query.activityLevel
				}
			});

			const adResponse = await adServingService.serveAd(adRequest);

			if (!adResponse) {
				res.status(204).json({ message: 'No ad available' });
				return;
			}

			// Set caching headers for performance
			res.set({
				'Cache-Control': 'public, max-age=300', // 5 minutes
				Vary: 'User-Agent, Accept-Encoding'
			});

			res.json(adResponse);
		} catch (error) {
			console.error('Ad serving error:', error);
			res.status(500).json({
				error: 'Failed to serve ad',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Track ad events (impression, click, conversion)
	 * POST /api/ads/track/:eventType
	 */
	async trackEvent(req: Request, res: Response): Promise<void> {
		try {
			const eventType = req.params.eventType as 'impression' | 'click' | 'conversion';
			const trackingData = trackingEventSchema.parse({
				...req.body,
				eventType
			});

			// Track the event asynchronously
			// In production, this would be sent to analytics pipeline
			setTimeout(async () => {
				try {
					// TODO: Implement event tracking service
					console.log('Tracking event:', trackingData);
				} catch (error) {
					console.error('Failed to track event:', error);
				}
			}, 0);

			// Return quickly to avoid blocking user experience
			res.status(200).json({ success: true });
		} catch (error) {
			console.error('Event tracking error:', error);
			res.status(400).json({
				error: 'Invalid tracking data',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Create new advertising campaign
	 * POST /api/ads/campaigns
	 */
	async createCampaign(req: Request, res: Response): Promise<void> {
		try {
			// TODO: Extract user ID from JWT token
			const advertiserUserId = req.body.userId || 'user-123';

			const campaignData = createCampaignSchema.parse(req.body);

			const result = await campaignManagementService.createCampaign(advertiserUserId, {
				...campaignData,
				startDate: campaignData.startDate ? new Date(campaignData.startDate) : undefined,
				endDate: campaignData.endDate ? new Date(campaignData.endDate) : undefined
			});

			res.status(201).json(result);
		} catch (error) {
			console.error('Campaign creation error:', error);
			res.status(400).json({
				error: 'Failed to create campaign',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get campaign details
	 * GET /api/ads/campaigns/:campaignId
	 */
	async getCampaign(req: Request, res: Response): Promise<void> {
		try {
			const { campaignId } = req.params;
			const advertiserUserId = req.body.userId || 'user-123';

			const campaign = await campaignManagementService.getCampaign(campaignId, advertiserUserId);

			res.json(campaign);
		} catch (error) {
			console.error('Get campaign error:', error);
			res.status(404).json({
				error: 'Campaign not found',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * List user's campaigns
	 * GET /api/ads/campaigns
	 */
	async listCampaigns(req: Request, res: Response): Promise<void> {
		try {
			const advertiserUserId = req.body.userId || 'user-123';

			const filters = {
				status: req.query.status as string,
				type: req.query.type as string,
				limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
				offset: req.query.offset ? parseInt(req.query.offset as string) : 0
			};

			const result = await campaignManagementService.listCampaigns(advertiserUserId, filters);

			res.json(result);
		} catch (error) {
			console.error('List campaigns error:', error);
			res.status(500).json({
				error: 'Failed to list campaigns',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Update campaign
	 * PUT /api/ads/campaigns/:campaignId
	 */
	async updateCampaign(req: Request, res: Response): Promise<void> {
		try {
			const { campaignId } = req.params;
			const advertiserUserId = req.body.userId || 'user-123';

			// Validate update data (subset of create schema)
			const updateData = req.body;

			const campaign = await campaignManagementService.updateCampaign(
				campaignId,
				advertiserUserId,
				updateData
			);

			res.json(campaign);
		} catch (error) {
			console.error('Update campaign error:', error);
			res.status(400).json({
				error: 'Failed to update campaign',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Delete campaign
	 * DELETE /api/ads/campaigns/:campaignId
	 */
	async deleteCampaign(req: Request, res: Response): Promise<void> {
		try {
			const { campaignId } = req.params;
			const advertiserUserId = req.body.userId || 'user-123';

			await campaignManagementService.deleteCampaign(campaignId, advertiserUserId);

			res.status(204).send();
		} catch (error) {
			console.error('Delete campaign error:', error);
			res.status(400).json({
				error: 'Failed to delete campaign',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get campaign analytics
	 * GET /api/ads/campaigns/:campaignId/analytics
	 */
	async getCampaignAnalytics(req: Request, res: Response): Promise<void> {
		try {
			const { campaignId } = req.params;
			const { from, to } = req.query;

			const timeRange =
				from && to
					? {
							from: new Date(from as string),
							to: new Date(to as string)
						}
					: undefined;

			const analytics = await campaignManagementService.getCampaignAnalytics(campaignId, timeRange);

			res.json(analytics);
		} catch (error) {
			console.error('Get analytics error:', error);
			res.status(500).json({
				error: 'Failed to get analytics',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get bid recommendations
	 * GET /api/ads/campaigns/:campaignId/bid-recommendations
	 */
	async getBidRecommendations(req: Request, res: Response): Promise<void> {
		try {
			const { campaignId } = req.params;

			const recommendations = await campaignManagementService.getBidRecommendations(campaignId);

			res.json(recommendations);
		} catch (error) {
			console.error('Get bid recommendations error:', error);
			res.status(500).json({
				error: 'Failed to get bid recommendations',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Optimize campaign
	 * POST /api/ads/campaigns/:campaignId/optimize
	 */
	async optimizeCampaign(req: Request, res: Response): Promise<void> {
		try {
			const { campaignId } = req.params;
			const advertiserUserId = req.body.userId || 'user-123';

			const result = await campaignManagementService.optimizeCampaign(campaignId, advertiserUserId);

			res.json(result);
		} catch (error) {
			console.error('Optimize campaign error:', error);
			res.status(500).json({
				error: 'Failed to optimize campaign',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get available ad placements
	 * GET /api/ads/placements
	 */
	async getAvailablePlacements(req: Request, res: Response): Promise<void> {
		try {
			const filters = {
				position: req.query.position as string,
				forumZoneSlug: req.query.forumZoneSlug as string,
				forumSlug: req.query.forumSlug as string,
				isActive: req.query.isActive ? req.query.isActive === 'true' : true
			};

			const placements = await adConfigurationService.listPlacements(filters);

			// Filter out sensitive admin data for public API
			const publicPlacements = placements.map((placement) => ({
				id: placement.id,
				name: placement.name,
				slug: placement.slug,
				position: placement.position,
				dimensions: placement.dimensions,
				allowedFormats: placement.allowedFormats,
				floorPriceCpm: placement.floorPriceCpm,
				maxDailyImpressions: placement.maxDailyImpressions
			}));

			res.json(publicPlacements);
		} catch (error) {
			console.error('Get placements error:', error);
			res.status(500).json({
				error: 'Failed to get placements',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get system configuration (public subset)
	 * GET /api/ads/config
	 */
	async getPublicConfig(req: Request, res: Response): Promise<void> {
		try {
			const config = await adConfigurationService.getSystemConfiguration();

			// Return only public configuration
			const publicConfig = {
				placements: {
					enabled: config.placements.enabled,
					approvalRequired: config.placements.approvalRequired
				},
				content: {
					cryptoContentOnly: config.content.cryptoContentOnly,
					requireDisclaimer: config.content.requireDisclaimer
				},
				targeting: {
					requireConsent: config.targeting.requireConsent
				}
			};

			res.json(publicConfig);
		} catch (error) {
			console.error('Get config error:', error);
			res.status(500).json({
				error: 'Failed to get configuration',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Helper method to detect device type from user agent
	 */
	private getDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
		const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
		const tabletRegex = /iPad|Android(?!.*Mobile)/i;

		if (tabletRegex.test(userAgent)) {
			return 'tablet';
		} else if (mobileRegex.test(userAgent)) {
			return 'mobile';
		} else {
			return 'desktop';
		}
	}
}

export const adController = new AdController();
