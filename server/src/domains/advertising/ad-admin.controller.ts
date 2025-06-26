import { Request, Response } from 'express';
import { z } from 'zod';
import { adConfigurationService } from './ad-configuration.service';
import { campaignManagementService } from './campaign-management.service';

// Admin validation schemas
const placementConfigSchema = z.object({
	name: z.string().min(1).max(255),
	slug: z.string().min(1).max(100),
	description: z.string().optional(),
	position: z.enum([
		'header_banner',
		'sidebar_top',
		'sidebar_middle',
		'sidebar_bottom',
		'thread_header',
		'thread_footer',
		'between_posts',
		'forum_header',
		'zone_header',
		'mobile_banner'
	]),
	forumZoneSlug: z.string().optional(),
	forumSlug: z.string().optional(),
	allowedFormats: z.array(z.string()),
	dimensions: z.string().optional(),
	maxFileSize: z.number().positive().optional(),
	floorPriceCpm: z.number().positive(),
	maxDailyImpressions: z.number().positive().optional(),
	priority: z.number().int().positive(),
	targetingConstraints: z.object({}).passthrough(),
	displayRules: z.object({}).passthrough(),
	requiresApproval: z.boolean()
});

const globalRuleSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	ruleType: z.enum([
		'targeting',
		'bidding',
		'display',
		'frequency',
		'content_filter',
		'fraud_prevention'
	]),
	conditions: z.array(
		z.object({
			field: z.string(),
			operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'in', 'contains']),
			value: z.any(),
			logic: z.enum(['AND', 'OR']).optional()
		})
	),
	actions: z.array(
		z.object({
			type: z.enum([
				'block_ad',
				'adjust_bid',
				'set_frequency_cap',
				'require_approval',
				'flag_for_review'
			]),
			parameters: z.any()
		})
	),
	priority: z.number().int().positive(),
	isActive: z.boolean(),
	validFrom: z.string().datetime().optional(),
	validUntil: z.string().datetime().optional()
});

const systemConfigSchema = z.object({
	placements: z
		.object({
			enabled: z.boolean(),
			defaultFloorPrice: z.number().positive(),
			maxDailyBudget: z.number().positive(),
			approvalRequired: z.boolean()
		})
		.optional(),
	targeting: z
		.object({
			enablePersonalization: z.boolean(),
			dataRetentionDays: z.number().int().positive(),
			requireConsent: z.boolean(),
			allowCrossSiteTracking: z.boolean()
		})
		.optional(),
	revenue: z
		.object({
			platformCommission: z.number().min(0).max(100),
			dgtRewardPool: z.number().positive(),
			minimumPayout: z.number().positive(),
			payoutSchedule: z.enum(['daily', 'weekly', 'monthly'])
		})
		.optional(),
	content: z
		.object({
			autoApproval: z.boolean(),
			adultContentAllowed: z.boolean(),
			cryptoContentOnly: z.boolean(),
			requireDisclaimer: z.boolean()
		})
		.optional(),
	governance: z
		.object({
			enableCommunityVoting: z.boolean(),
			minimumTokensToVote: z.number().positive(),
			votingPeriodDays: z.number().int().positive(),
			quorumPercentage: z.number().min(1).max(100)
		})
		.optional()
});

const governanceProposalSchema = z.object({
	title: z.string().min(1).max(255),
	description: z.string().min(10),
	proposalType: z.string(),
	proposedChanges: z.object({}).passthrough()
});

/**
 * Ad Admin Controller
 * Handles administrative functions for the ad system
 */
export class AdAdminController {
	/**
	 * Get full system configuration
	 * GET /api/admin/ads/config
	 */
	async getSystemConfiguration(req: Request, res: Response): Promise<void> {
		try {
			// TODO: Verify admin permissions
			const config = await adConfigurationService.getSystemConfiguration();
			res.json(config);
		} catch (error) {
			console.error('Get system config error:', error);
			res.status(500).json({
				error: 'Failed to get system configuration',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Update system configuration
	 * PUT /api/admin/ads/config
	 */
	async updateSystemConfiguration(req: Request, res: Response): Promise<void> {
		try {
			const adminUserId = req.body.userId || 'admin-123'; // TODO: Extract from JWT
			const configUpdates = systemConfigSchema.parse(req.body);

			const updatedConfig = await adConfigurationService.updateSystemConfiguration(
				configUpdates,
				adminUserId
			);

			res.json(updatedConfig);
		} catch (error) {
			console.error('Update system config error:', error);
			res.status(400).json({
				error: 'Failed to update system configuration',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Create ad placement
	 * POST /api/admin/ads/placements
	 */
	async createPlacement(req: Request, res: Response): Promise<void> {
		try {
			const placementData = placementConfigSchema.parse(req.body);
			const placement = await adConfigurationService.createPlacement(placementData);

			res.status(201).json(placement);
		} catch (error) {
			console.error('Create placement error:', error);
			res.status(400).json({
				error: 'Failed to create placement',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Update ad placement
	 * PUT /api/admin/ads/placements/:placementId
	 */
	async updatePlacement(req: Request, res: Response): Promise<void> {
		try {
			const { placementId } = req.params;
			const updates = req.body;

			const placement = await adConfigurationService.updatePlacement(placementId, updates);

			res.json(placement);
		} catch (error) {
			console.error('Update placement error:', error);
			res.status(400).json({
				error: 'Failed to update placement',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Delete ad placement
	 * DELETE /api/admin/ads/placements/:placementId
	 */
	async deletePlacement(req: Request, res: Response): Promise<void> {
		try {
			const { placementId } = req.params;
			await adConfigurationService.deletePlacement(placementId);

			res.status(204).send();
		} catch (error) {
			console.error('Delete placement error:', error);
			res.status(400).json({
				error: 'Failed to delete placement',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get all placements with admin data
	 * GET /api/admin/ads/placements
	 */
	async listAllPlacements(req: Request, res: Response): Promise<void> {
		try {
			const filters = {
				position: req.query.position as string,
				forumZoneSlug: req.query.forumZoneSlug as string,
				forumSlug: req.query.forumSlug as string,
				isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
			};

			const placements = await adConfigurationService.listPlacements(filters);

			// Include admin analytics for each placement
			const placementsWithAnalytics = await Promise.all(
				placements.map(async (placement) => {
					const analytics = await adConfigurationService.getPlacementAnalytics(placement.id);
					return { ...placement, analytics };
				})
			);

			res.json(placementsWithAnalytics);
		} catch (error) {
			console.error('List placements error:', error);
			res.status(500).json({
				error: 'Failed to list placements',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Create global rule
	 * POST /api/admin/ads/rules
	 */
	async createGlobalRule(req: Request, res: Response): Promise<void> {
		try {
			const ruleData = globalRuleSchema.parse(req.body);

			const rule = await adConfigurationService.createGlobalRule({
				...ruleData,
				validFrom: ruleData.validFrom ? new Date(ruleData.validFrom) : undefined,
				validUntil: ruleData.validUntil ? new Date(ruleData.validUntil) : undefined
			});

			res.status(201).json(rule);
		} catch (error) {
			console.error('Create rule error:', error);
			res.status(400).json({
				error: 'Failed to create rule',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Update global rule
	 * PUT /api/admin/ads/rules/:ruleId
	 */
	async updateGlobalRule(req: Request, res: Response): Promise<void> {
		try {
			const { ruleId } = req.params;
			const updates = req.body;

			const rule = await adConfigurationService.updateGlobalRule(ruleId, updates);

			res.json(rule);
		} catch (error) {
			console.error('Update rule error:', error);
			res.status(400).json({
				error: 'Failed to update rule',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * List global rules
	 * GET /api/admin/ads/rules
	 */
	async listGlobalRules(req: Request, res: Response): Promise<void> {
		try {
			const filters = {
				ruleType: req.query.ruleType as string,
				isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
			};

			const rules = await adConfigurationService.listGlobalRules(filters);

			res.json(rules);
		} catch (error) {
			console.error('List rules error:', error);
			res.status(500).json({
				error: 'Failed to list rules',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get platform-wide analytics
	 * GET /api/admin/ads/analytics
	 */
	async getPlatformAnalytics(req: Request, res: Response): Promise<void> {
		try {
			const { from, to } = req.query;

			// TODO: Implement platform-wide analytics aggregation
			const analytics = {
				totalRevenue: 125430.75,
				totalImpressions: 2450000,
				totalClicks: 58500,
				averageCtr: 0.0239,
				averageCpm: 1.87,
				activeCampaigns: 156,
				totalAdvertisers: 89,
				dgtRewardsDistributed: 15240.5,
				topPerformingPlacements: [
					{
						placementId: 'placement-1',
						name: 'Header Banner',
						revenue: 45230.25,
						fillRate: 0.92
					}
				],
				revenueByDay: [
					{ date: '2025-06-20', revenue: 4250.75 },
					{ date: '2025-06-21', revenue: 4580.25 },
					{ date: '2025-06-22', revenue: 3920.5 }
				]
			};

			res.json(analytics);
		} catch (error) {
			console.error('Get platform analytics error:', error);
			res.status(500).json({
				error: 'Failed to get platform analytics',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get all campaigns (admin view)
	 * GET /api/admin/ads/campaigns
	 */
	async getAllCampaigns(req: Request, res: Response): Promise<void> {
		try {
			const filters = {
				status: req.query.status as string,
				type: req.query.type as string,
				advertiser: req.query.advertiser as string,
				limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
				offset: req.query.offset ? parseInt(req.query.offset as string) : 0
			};

			// TODO: Implement admin-level campaign listing
			// This would show all campaigns across all advertisers
			const campaigns = {
				campaigns: [],
				total: 0,
				filters: filters
			};

			res.json(campaigns);
		} catch (error) {
			console.error('Get all campaigns error:', error);
			res.status(500).json({
				error: 'Failed to get campaigns',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Approve/reject campaign
	 * POST /api/admin/ads/campaigns/:campaignId/review
	 */
	async reviewCampaign(req: Request, res: Response): Promise<void> {
		try {
			const { campaignId } = req.params;
			const { action, reason } = req.body; // action: 'approve' | 'reject'

			if (!['approve', 'reject'].includes(action)) {
				res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
				return;
			}

			// TODO: Implement campaign review logic
			const newStatus = action === 'approve' ? 'active' : 'cancelled';

			// Update campaign status and add review note
			const result = {
				campaignId,
				action,
				newStatus,
				reviewedAt: new Date(),
				reason
			};

			res.json(result);
		} catch (error) {
			console.error('Review campaign error:', error);
			res.status(400).json({
				error: 'Failed to review campaign',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Create governance proposal
	 * POST /api/admin/ads/governance/proposals
	 */
	async createGovernanceProposal(req: Request, res: Response): Promise<void> {
		try {
			const proposerUserId = req.body.userId || 'admin-123'; // TODO: Extract from JWT
			const proposalData = governanceProposalSchema.parse(req.body);

			const proposal = await adConfigurationService.createGovernanceProposal({
				...proposalData,
				proposerUserId
			});

			res.status(201).json(proposal);
		} catch (error) {
			console.error('Create proposal error:', error);
			res.status(400).json({
				error: 'Failed to create proposal',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Execute governance proposal
	 * POST /api/admin/ads/governance/proposals/:proposalId/execute
	 */
	async executeGovernanceProposal(req: Request, res: Response): Promise<void> {
		try {
			const { proposalId } = req.params;

			await adConfigurationService.executeGovernanceProposal(proposalId);

			res.json({ success: true, message: 'Proposal executed successfully' });
		} catch (error) {
			console.error('Execute proposal error:', error);
			res.status(400).json({
				error: 'Failed to execute proposal',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get fraud detection alerts
	 * GET /api/admin/ads/fraud/alerts
	 */
	async getFraudAlerts(req: Request, res: Response): Promise<void> {
		try {
			// TODO: Implement fraud detection system
			const alerts = [
				{
					id: 'alert-1',
					type: 'suspicious_traffic',
					severity: 'high',
					campaignId: 'campaign-123',
					description: 'Unusual click patterns detected',
					detectedAt: new Date(),
					status: 'active'
				}
			];

			res.json(alerts);
		} catch (error) {
			console.error('Get fraud alerts error:', error);
			res.status(500).json({
				error: 'Failed to get fraud alerts',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Get revenue reports
	 * GET /api/admin/ads/reports/revenue
	 */
	async getRevenueReport(req: Request, res: Response): Promise<void> {
		try {
			const { from, to, granularity = 'daily' } = req.query;

			// TODO: Implement revenue reporting
			const report = {
				period: { from, to },
				granularity,
				totalRevenue: 125430.75,
				platformCommission: 37629.23,
				advertiserSpend: 87801.52,
				dgtRewardsDistributed: 15240.5,
				breakdown: [
					{
						date: '2025-06-20',
						revenue: 4250.75,
						commission: 1275.23,
						advertiserSpend: 2975.52
					}
				]
			};

			res.json(report);
		} catch (error) {
			console.error('Get revenue report error:', error);
			res.status(500).json({
				error: 'Failed to get revenue report',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	/**
	 * Export analytics data
	 * GET /api/admin/ads/export
	 */
	async exportAnalytics(req: Request, res: Response): Promise<void> {
		try {
			const { format = 'csv', type = 'campaigns', from, to } = req.query;

			if (!['csv', 'json'].includes(format as string)) {
				res.status(400).json({ error: 'Format must be csv or json' });
				return;
			}

			// TODO: Implement data export
			const exportData = {
				type,
				format,
				period: { from, to },
				generatedAt: new Date(),
				downloadUrl: '/api/admin/ads/downloads/export-12345.csv'
			};

			res.json(exportData);
		} catch (error) {
			console.error('Export analytics error:', error);
			res.status(500).json({
				error: 'Failed to export analytics',
				message: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
}

export const adAdminController = new AdAdminController();
