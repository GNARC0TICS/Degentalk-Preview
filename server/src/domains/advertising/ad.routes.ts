import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { adController } from './ad.controller';
import { adAdminController } from './ad-admin.controller';
import { adConfigurationService } from './ad-configuration.service';
import { userPromotionRoutes } from './user-promotion.routes';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { getUser } from '@core/utils/auth.helpers';
import { authenticate, requireAdmin } from '@middleware/auth';
import { rateLimiters } from '@core/services/rate-limit.service';

const router: RouterType = Router();

// ============================================================================
// PUBLIC AD SERVING ROUTES
// ============================================================================

/**
 * Serve ad for placement
 * GET /api/ads/serve?placement=header_banner&sessionId=abc123&...
 *
 * Query Parameters:
 * - placement: string (required) - Placement slug
 * - sessionId: string - Session identifier
 * - userHash: string - Anonymous user identifier
 * - forumSlug: string - Current forum context
 * - threadId: string - Current thread context
 * - region: string - Geographic region
 * - timezone: string - User timezone
 * - dgtBalanceTier: string - User's DGT balance tier
 * - xpLevel: number - User's XP level
 * - interestSegments: string - Comma-separated interests
 * - activityLevel: string - User activity level
 */
router.get('/serve', rateLimiters.general, adController.serveAd.bind(adController));

/**
 * Track ad events
 * POST /api/ads/track/:eventType
 *
 * Event Types: impression | click | conversion
 * Body: { campaign, placement, session, metadata? }
 */
router.post('/track/:eventType', rateLimiters.general, adController.trackEvent.bind(adController));

/**
 * Get available placements
 * GET /api/ads/placements
 */
router.get('/placements', adController.getAvailablePlacements.bind(adController));

/**
 * Get public configuration
 * GET /api/ads/config
 */
router.get('/config', adController.getPublicConfig.bind(adController));

// ============================================================================
// ADVERTISER CAMPAIGN MANAGEMENT ROUTES
// ============================================================================

/**
 * Create campaign
 * POST /api/ads/campaigns
 */
router.post('/campaigns', authenticate, adController.createCampaign.bind(adController));

/**
 * List user's campaigns
 * GET /api/ads/campaigns
 */
router.get('/campaigns', authenticate, adController.listCampaigns.bind(adController));

/**
 * Get campaign details
 * GET /api/ads/campaigns/:campaignId
 */
router.get('/campaigns/:campaignId', authenticate, adController.getCampaign.bind(adController));

/**
 * Update campaign
 * PUT /api/ads/campaigns/:campaignId
 */
router.put('/campaigns/:campaignId', authenticate, adController.updateCampaign.bind(adController));

/**
 * Delete campaign
 * DELETE /api/ads/campaigns/:campaignId
 */
router.delete('/campaigns/:campaignId', authenticate, adController.deleteCampaign.bind(adController));

/**
 * Get campaign analytics
 * GET /api/ads/campaigns/:campaignId/analytics?from=2025-06-01&to=2025-06-30
 */
router.get(
	'/campaigns/:campaignId/analytics',
	authenticate,
	adController.getCampaignAnalytics.bind(adController)
);

/**
 * Get bid recommendations
 * GET /api/ads/campaigns/:campaignId/bid-recommendations
 */
router.get(
	'/campaigns/:campaignId/bid-recommendations',
	authenticate,
	adController.getBidRecommendations.bind(adController)
);

/**
 * Optimize campaign automatically
 * POST /api/ads/campaigns/:campaignId/optimize
 */
router.post('/campaigns/:campaignId/optimize', authenticate, adController.optimizeCampaign.bind(adController));

// ============================================================================
// GOVERNANCE ROUTES (PUBLIC VOTING)
// ============================================================================

/**
 * Vote on governance proposal
 * POST /api/ads/governance/proposals/:proposalId/vote
 */
router.post('/governance/proposals/:proposalId/vote', authenticate, async (req, res) => {
	try {
		const { proposalId } = req.params;
		const { vote, reason } = req.body;
		const user = getUser(req);
		if (!user) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		// TODO: Get user's DGT token balance for voting power
		const votingPower = 1000; // Mock voting power

		await adConfigurationService.voteOnProposal(proposalId, user.id, vote, votingPower, reason);

		sendSuccessResponse(res, { success: true, message: 'Vote recorded successfully' });
	} catch (error) {
		logger.error('Vote error:', error);
		sendErrorResponse(res, 'Failed to record vote', 400);
	}
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * Get system configuration (admin)
 * GET /api/ads/admin/config
 */
router.get('/admin/config', rateLimiters.admin, requireAdmin, adAdminController.getSystemConfiguration.bind(adAdminController));

/**
 * Update system configuration (admin)
 * PUT /api/ads/admin/config
 */
router.put('/admin/config', rateLimiters.admin, requireAdmin, adAdminController.updateSystemConfiguration.bind(adAdminController));

/**
 * Create ad placement (admin)
 * POST /api/ads/admin/placements
 */
router.post('/admin/placements', rateLimiters.admin, requireAdmin, adAdminController.createPlacement.bind(adAdminController));

/**
 * Update ad placement (admin)
 * PUT /api/ads/admin/placements/:placementId
 */
router.put(
	'/admin/placements/:placementId',
	rateLimiters.admin,
	requireAdmin,
	adAdminController.updatePlacement.bind(adAdminController)
);

/**
 * Delete ad placement (admin)
 * DELETE /api/ads/admin/placements/:placementId
 */
router.delete(
	'/admin/placements/:placementId',
	rateLimiters.admin,
	requireAdmin,
	adAdminController.deletePlacement.bind(adAdminController)
);

/**
 * List all placements with analytics (admin)
 * GET /api/ads/admin/placements
 */
router.get('/admin/placements', rateLimiters.admin, requireAdmin, adAdminController.listAllPlacements.bind(adAdminController));

/**
 * Create global rule (admin)
 * POST /api/ads/admin/rules
 */
router.post('/admin/rules', rateLimiters.admin, requireAdmin, adAdminController.createGlobalRule.bind(adAdminController));

/**
 * Update global rule (admin)
 * PUT /api/ads/admin/rules/:ruleId
 */
router.put('/admin/rules/:ruleId', rateLimiters.admin, requireAdmin, adAdminController.updateGlobalRule.bind(adAdminController));

/**
 * List global rules (admin)
 * GET /api/ads/admin/rules
 */
router.get('/admin/rules', rateLimiters.admin, requireAdmin, adAdminController.listGlobalRules.bind(adAdminController));

/**
 * Get platform analytics (admin)
 * GET /api/ads/admin/analytics
 */
router.get('/admin/analytics', rateLimiters.admin, requireAdmin, adAdminController.getPlatformAnalytics.bind(adAdminController));

/**
 * Get all campaigns (admin)
 * GET /api/ads/admin/campaigns
 */
router.get('/admin/campaigns', rateLimiters.admin, requireAdmin, adAdminController.getAllCampaigns.bind(adAdminController));

/**
 * Review campaign (admin)
 * POST /api/ads/admin/campaigns/:campaignId/review
 */
router.post(
	'/admin/campaigns/:campaignId/review',
	rateLimiters.admin,
	requireAdmin,
	adAdminController.reviewCampaign.bind(adAdminController)
);

/**
 * Create governance proposal (admin)
 * POST /api/ads/admin/governance/proposals
 */
router.post(
	'/admin/governance/proposals',
	rateLimiters.admin,
	requireAdmin,
	adAdminController.createGovernanceProposal.bind(adAdminController)
);

/**
 * Execute governance proposal (admin)
 * POST /api/ads/admin/governance/proposals/:proposalId/execute
 */
router.post(
	'/admin/governance/proposals/:proposalId/execute',
	rateLimiters.admin,
	requireAdmin,
	adAdminController.executeGovernanceProposal.bind(adAdminController)
);

/**
 * Get fraud alerts (admin)
 * GET /api/ads/admin/fraud/alerts
 */
router.get('/admin/fraud/alerts', rateLimiters.admin, requireAdmin, adAdminController.getFraudAlerts.bind(adAdminController));

/**
 * Get revenue report (admin)
 * GET /api/ads/admin/reports/revenue
 */
router.get('/admin/reports/revenue', rateLimiters.admin, requireAdmin, adAdminController.getRevenueReport.bind(adAdminController));

/**
 * Export analytics (admin)
 * GET /api/ads/admin/export
 */
router.get('/admin/export', rateLimiters.admin, requireAdmin, adAdminController.exportAnalytics.bind(adAdminController));

// ============================================================================
// MIDDLEWARE FOR RATE LIMITING AND AUTHENTICATION
// ============================================================================

// Note: Authentication middleware is applied individually to each route above
// Rate limiting is handled in the rate-limit service

// ============================================================================
// USER PROMOTION ROUTES
// ============================================================================

// Mount user promotion routes
router.use('/', userPromotionRoutes);

export { router as adRoutes };
