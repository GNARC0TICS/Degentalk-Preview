import { eq, and, sql, desc, count } from 'drizzle-orm';
import { db } from '@server/src/core/db';
import {
	campaigns,
	campaignRules,
	adPlacements,
	cryptoPayments,
	campaignMetrics,
	type Campaign,
	type CampaignRule,
	type CryptoPayment
} from '@schema';
import type { Id } from '@shared/types/ids';

export interface CreateCampaignRequest {
	name: string;
	description?: string;
	type:
		| 'display_banner'
		| 'sponsored_thread'
		| 'forum_spotlight'
		| 'user_reward'
		| 'native_content';
	totalBudget: number;
	dailyBudget?: number;
	paymentMethod: 'dgt_tokens' | 'usdt' | 'bitcoin' | 'ethereum' | 'stripe';
	pricingModel: 'CPM' | 'CPC' | 'CPA' | 'FLAT';
	bidAmount: number;
	startDate?: Date;
	endDate?: Date;
	targetingRules: any;
	placementRules: any;
	frequencyCap: any;
	creativeAssets: any[];
	optimizationGoal?: string;
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
	status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface CampaignAnalytics {
	impressions: number;
	clicks: number;
	conversions: number;
	spend: number;
	revenue: number;
	ctr: number;
	cpm: number;
	cpc: number;
	roas: number;
	dgtRewards: number;
	timeSeriesData: {
		date: string;
		impressions: number;
		clicks: number;
		spend: number;
	}[];
}

/**
 * Campaign Management Service
 * Handles CRUD operations, budget management, and performance optimization
 */
export class CampaignManagementService {
	/**
	 * Create a new advertising campaign
	 */
	async createCampaign(
		advertiserUserId: string,
		request: CreateCampaignRequest
	): Promise<{ campaign: Campaign; paymentRequired?: CryptoPayment }> {
		// Validate campaign configuration
		await this.validateCampaignRequest(request);

		// Create campaign in draft status
		const [campaign] = await db
			.insert(campaigns)
			.values({
				name: request.name,
				description: request.description,
				advertiserUserId,
				type: request.type,
				status: 'draft',
				totalBudget: request.totalBudget.toString(),
				dailyBudget: request.dailyBudget?.toString(),
				paymentMethod: request.paymentMethod,
				pricingModel: request.pricingModel,
				bidAmount: request.bidAmount.toString(),
				startDate: request.startDate,
				endDate: request.endDate,
				targetingRules: request.targetingRules,
				placementRules: request.placementRules,
				frequencyCap: request.frequencyCap,
				creativeAssets: request.creativeAssets,
				optimizationGoal: request.optimizationGoal
			})
			.returning();

		// Handle payment if required
		let paymentRequired: CryptoPayment | undefined;
		if (request.paymentMethod !== 'stripe' && request.totalBudget > 0) {
			paymentRequired = await this.createCryptoPayment(campaign, advertiserUserId);
		}

		return { campaign, paymentRequired };
	}

	/**
	 * Update existing campaign
	 */
	async updateCampaign(
		campaignId: string,
		advertiserUserId: string,
		request: UpdateCampaignRequest
	): Promise<Campaign> {
		// Verify ownership
		await this.verifyCampaignOwnership(campaignId, advertiserUserId);

		// Validate status transitions
		if (request.status) {
			await this.validateStatusTransition(campaignId, request.status);
		}

		const [updatedCampaign] = await db
			.update(campaigns)
			.set({
				...request,
				totalBudget: request.totalBudget?.toString(),
				dailyBudget: request.dailyBudget?.toString(),
				bidAmount: request.bidAmount?.toString(),
				updatedAt: new Date()
			})
			.where(eq(campaigns.id, campaignId))
			.returning();

		return updatedCampaign;
	}

	/**
	 * Get campaign details with analytics
	 */
	async getCampaign(
		campaignId: string,
		advertiserUserId: string
	): Promise<Campaign & { analytics: CampaignAnalytics }> {
		// Verify ownership
		await this.verifyCampaignOwnership(campaignId, advertiserUserId);

		const [campaign] = await db
			.select()
			.from(campaigns)
			.where(eq(campaigns.id, campaignId))
			.limit(1);

		if (!campaign) {
			throw new Error('Campaign not found');
		}

		const analytics = await this.getCampaignAnalytics(campaignId);

		return { ...campaign, analytics };
	}

	/**
	 * List campaigns for advertiser
	 */
	async listCampaigns(
		advertiserUserId: string,
		filters: {
			status?: string;
			type?: string;
			limit?: number;
			offset?: number;
		} = {}
	): Promise<{ campaigns: Campaign[]; total: number }> {
		const { limit = 20, offset = 0 } = filters;

		let query = db.select().from(campaigns).where(eq(campaigns.advertiserUserId, advertiserUserId));

		if (filters.status) {
			query = query.where(eq(campaigns.status, filters.status as any));
		}

		if (filters.type) {
			query = query.where(eq(campaigns.type, filters.type as any));
		}

		const campaignsList = await query
			.orderBy(desc(campaigns.createdAt))
			.limit(limit)
			.offset(offset);

		const [{ total }] = await db
			.select({ total: count() })
			.from(campaigns)
			.where(eq(campaigns.advertiserUserId, advertiserUserId));

		return { campaigns: campaignsList, total };
	}

	/**
	 * Delete campaign (soft delete)
	 */
	async deleteCampaign(campaignId: string, advertiserUserId: string): Promise<void> {
		await this.verifyCampaignOwnership(campaignId, advertiserUserId);

		// Check if campaign is running
		const [campaign] = await db
			.select({ status: campaigns.status })
			.from(campaigns)
			.where(eq(campaigns.id, campaignId))
			.limit(1);

		if (campaign?.status === 'active') {
			throw new Error('Cannot delete active campaign. Pause it first.');
		}

		// Soft delete by setting status to cancelled
		await db
			.update(campaigns)
			.set({ status: 'cancelled', isActive: false, updatedAt: new Date() })
			.where(eq(campaigns.id, campaignId));
	}

	/**
	 * Create campaign rule for dynamic configuration
	 */
	async createCampaignRule(
		campaignId: string,
		advertiserUserId: string,
		rule: {
			name: string;
			description?: string;
			ruleType: string;
			conditions: any[];
			actions: any[];
			priority?: number;
			validFrom?: Date;
			validUntil?: Date;
		}
	): Promise<CampaignRule> {
		await this.verifyCampaignOwnership(campaignId, advertiserUserId);

		const [campaignRule] = await db
			.insert(campaignRules)
			.values({
				name: rule.name,
				description: rule.description,
				campaignId,
				ruleType: rule.ruleType,
				conditions: rule.conditions,
				actions: rule.actions,
				priority: rule.priority || 1,
				validFrom: rule.validFrom,
				validUntil: rule.validUntil
			})
			.returning();

		return campaignRule;
	}

	/**
	 * Get campaign analytics
	 */
	async getCampaignAnalytics(
		campaignId: string,
		timeRange?: { from: Date; to: Date }
	): Promise<CampaignAnalytics> {
		const from = timeRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
		const to = timeRange?.to || new Date();

		// Get aggregated metrics
		const [metricsResult] = await db
			.select({
				impressions: sql<number>`COALESCE(SUM(${campaignMetrics.impressions}), 0)`,
				clicks: sql<number>`COALESCE(SUM(${campaignMetrics.clicks}), 0)`,
				conversions: sql<number>`COALESCE(SUM(${campaignMetrics.conversions}), 0)`,
				spend: sql<number>`COALESCE(SUM(${campaignMetrics.spend}), 0)`,
				revenue: sql<number>`COALESCE(SUM(${campaignMetrics.revenue}), 0)`,
				dgtRewards: sql<number>`COALESCE(SUM(${campaignMetrics.dgtRewards}), 0)`
			})
			.from(campaignMetrics)
			.where(
				and(
					eq(campaignMetrics.campaignId, campaignId),
					sql`${campaignMetrics.dateHour} >= ${from}`,
					sql`${campaignMetrics.dateHour} <= ${to}`
				)
			);

		// Calculate derived metrics
		const ctr =
			metricsResult.impressions > 0 ? metricsResult.clicks / metricsResult.impressions : 0;
		const cpm =
			metricsResult.impressions > 0 ? (metricsResult.spend / metricsResult.impressions) * 1000 : 0;
		const cpc = metricsResult.clicks > 0 ? metricsResult.spend / metricsResult.clicks : 0;
		const roas = metricsResult.spend > 0 ? metricsResult.revenue / metricsResult.spend : 0;

		// Get time series data (daily aggregation)
		const timeSeriesData = await db
			.select({
				date: sql<string>`DATE(${campaignMetrics.dateHour})`,
				impressions: sql<number>`SUM(${campaignMetrics.impressions})`,
				clicks: sql<number>`SUM(${campaignMetrics.clicks})`,
				spend: sql<number>`SUM(${campaignMetrics.spend})`
			})
			.from(campaignMetrics)
			.where(
				and(
					eq(campaignMetrics.campaignId, campaignId),
					sql`${campaignMetrics.dateHour} >= ${from}`,
					sql`${campaignMetrics.dateHour} <= ${to}`
				)
			)
			.groupBy(sql`DATE(${campaignMetrics.dateHour})`)
			.orderBy(sql`DATE(${campaignMetrics.dateHour})`);

		return {
			...metricsResult,
			ctr,
			cpm,
			cpc,
			roas,
			timeSeriesData
		};
	}

	/**
	 * Get bid recommendations based on performance data
	 */
	async getBidRecommendations(campaignId: string): Promise<{
		currentBid: Id<'currentBid'>;
		recommendedBid: Id<'recommendedBid'>;
		reasoning: string;
		expectedImprovement: {
			impressions: number;
			clicks: number;
			conversions: number;
		};
	}> {
		const [campaign] = await db
			.select()
			.from(campaigns)
			.where(eq(campaigns.id, campaignId))
			.limit(1);

		if (!campaign) {
			throw new Error('Campaign not found');
		}

		const analytics = await this.getCampaignAnalytics(campaignId);
		const currentBid = campaign.bidAmount?.toNumber() || 0;

		// Simple bid optimization logic
		let recommendedBid = currentBid;
		let reasoning = 'Current bid is optimal';

		if (analytics.ctr > 0.02) {
			// High CTR, can afford to bid higher
			recommendedBid = currentBid * 1.2;
			reasoning = 'High click-through rate suggests you can bid higher to get more volume';
		} else if (analytics.ctr < 0.005) {
			// Low CTR, need to improve targeting or creative
			recommendedBid = currentBid * 0.8;
			reasoning = 'Low click-through rate suggests reducing bid or improving targeting';
		}

		// Cap bid adjustments
		recommendedBid = Math.max(0.01, Math.min(currentBid * 2, recommendedBid));

		return {
			currentBid,
			recommendedBid: Math.round(recommendedBid * 100) / 100,
			reasoning,
			expectedImprovement: {
				impressions: Math.round((recommendedBid / currentBid - 1) * analytics.impressions),
				clicks: Math.round((recommendedBid / currentBid - 1) * analytics.clicks * 0.8),
				conversions: Math.round((recommendedBid / currentBid - 1) * analytics.conversions * 0.6)
			}
		};
	}

	/**
	 * Optimize campaign performance automatically
	 */
	async optimizeCampaign(
		campaignId: string,
		advertiserUserId: string
	): Promise<{
		changes: string[];
		expectedImprovement: string;
	}> {
		await this.verifyCampaignOwnership(campaignId, advertiserUserId);

		const analytics = await this.getCampaignAnalytics(campaignId);
		const bidRecommendation = await this.getBidRecommendations(campaignId);

		const changes: string[] = [];

		// Apply bid optimization
		if (Math.abs(bidRecommendation.recommendedBid - bidRecommendation.currentBid) > 0.01) {
			await db
				.update(campaigns)
				.set({
					bidAmount: bidRecommendation.recommendedBid.toString(),
					updatedAt: new Date()
				})
				.where(eq(campaigns.id, campaignId));

			changes.push(
				`Adjusted bid from $${bidRecommendation.currentBid} to $${bidRecommendation.recommendedBid}`
			);
		}

		// Pause underperforming campaigns
		if (analytics.spend > 50 && analytics.roas < 0.5) {
			await db
				.update(campaigns)
				.set({ status: 'paused', updatedAt: new Date() })
				.where(eq(campaigns.id, campaignId));

			changes.push('Paused campaign due to poor performance (ROAS < 0.5)');
		}

		return {
			changes,
			expectedImprovement: bidRecommendation.reasoning
		};
	}

	/**
	 * Private helper methods
	 */
	private async validateCampaignRequest(request: CreateCampaignRequest): Promise<void> {
		if (!request.name?.trim()) {
			throw new Error('Campaign name is required');
		}

		if (request.totalBudget <= 0) {
			throw new Error('Total budget must be greater than 0');
		}

		if (request.bidAmount <= 0) {
			throw new Error('Bid amount must be greater than 0');
		}

		if (request.dailyBudget && request.dailyBudget > request.totalBudget) {
			throw new Error('Daily budget cannot exceed total budget');
		}

		if (request.endDate && request.startDate && request.endDate <= request.startDate) {
			throw new Error('End date must be after start date');
		}

		// Validate creative assets
		if (!request.creativeAssets || request.creativeAssets.length === 0) {
			throw new Error('At least one creative asset is required');
		}
	}

	private async verifyCampaignOwnership(
		campaignId: string,
		advertiserUserId: string
	): Promise<void> {
		const [campaign] = await db
			.select({ advertiserUserId: campaigns.advertiserUserId })
			.from(campaigns)
			.where(eq(campaigns.id, campaignId))
			.limit(1);

		if (!campaign || campaign.advertiserUserId !== advertiserUserId) {
			throw new Error('Campaign not found or access denied');
		}
	}

	private async validateStatusTransition(campaignId: string, newStatus: string): Promise<void> {
		const [campaign] = await db
			.select({ status: campaigns.status })
			.from(campaigns)
			.where(eq(campaigns.id, campaignId))
			.limit(1);

		if (!campaign) {
			throw new Error('Campaign not found');
		}

		const currentStatus = campaign.status;

		// Define valid transitions
		const validTransitions: Record<string, string[]> = {
			draft: ['active', 'cancelled'],
			active: ['paused', 'completed', 'cancelled'],
			paused: ['active', 'cancelled'],
			completed: [],
			cancelled: []
		};

		if (!validTransitions[currentStatus]?.includes(newStatus)) {
			throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
		}
	}

	private async createCryptoPayment(
		campaign: Campaign,
		advertiserUserId: string
	): Promise<CryptoPayment> {
		const [payment] = await db
			.insert(cryptoPayments)
			.values({
				paymentHash: `payment_${campaign.id}_${Date.now()}`,
				campaignId: campaign.id,
				payerUserId: advertiserUserId,
				currency: campaign.paymentMethod === 'dgt_tokens' ? 'DGT' : 'USDT',
				amount: campaign.totalBudget!.toString(),
				status: 'pending',
				requiredConfirmations: campaign.paymentMethod === 'dgt_tokens' ? 1 : 3,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
			})
			.returning();

		return payment;
	}
}

export const campaignManagementService = new CampaignManagementService();
