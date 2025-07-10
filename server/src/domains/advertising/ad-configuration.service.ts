import { eq, and, sql, desc, asc } from 'drizzle-orm';
import { db } from '@core/db';
import {
	adPlacements,
	campaignRules,
	adGovernanceProposals,
	adGovernanceVotes,
	campaigns,
	type AdPlacement,
	type CampaignRule,
	type AdGovernanceProposal
} from '@schema';

export interface PlacementConfiguration {
	id?: string;
	name: string;
	slug: string;
	description?: string;
	position:
		| 'header_banner'
		| 'sidebar_top'
		| 'sidebar_middle'
		| 'sidebar_bottom'
		| 'thread_header'
		| 'thread_footer'
		| 'between_posts'
		| 'forum_header'
		| 'zone_header'
		| 'mobile_banner';
	forumZoneSlug?: string;
	forumSlug?: string;
	allowedFormats: string[];
	dimensions?: string;
	maxFileSize?: number;
	floorPriceCpm: number;
	maxDailyImpressions?: number;
	priority: number;
	targetingConstraints: any;
	displayRules: any;
	requiresApproval: boolean;
}

export interface GlobalRule {
	id?: string;
	name: string;
	description?: string;
	ruleType:
		| 'targeting'
		| 'bidding'
		| 'display'
		| 'frequency'
		| 'content_filter'
		| 'fraud_prevention';
	conditions: Array<{
		field: string;
		operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'contains';
		value: any;
		logic?: 'AND' | 'OR';
	}>;
	actions: Array<{
		type: 'block_ad' | 'adjust_bid' | 'set_frequency_cap' | 'require_approval' | 'flag_for_review';
		parameters: any;
	}>;
	priority: number;
	isActive: boolean;
	validFrom?: Date;
	validUntil?: Date;
}

export interface AdSystemConfiguration {
	placements: {
		enabled: boolean;
		defaultFloorPrice: number;
		maxDailyBudget: number;
		approvalRequired: boolean;
	};
	targeting: {
		enablePersonalization: boolean;
		dataRetentionDays: number;
		requireConsent: boolean;
		allowCrossSiteTracking: boolean;
	};
	revenue: {
		platformCommission: number; // Percentage
		dgtRewardPool: number; // DGT tokens allocated for rewards
		minimumPayout: number;
		payoutSchedule: 'daily' | 'weekly' | 'monthly';
	};
	content: {
		autoApproval: boolean;
		adultContentAllowed: boolean;
		cryptoContentOnly: boolean;
		requireDisclaimer: boolean;
	};
	governance: {
		enableCommunityVoting: boolean;
		minimumTokensToVote: number;
		votingPeriodDays: number;
		quorumPercentage: number;
	};
}

/**
 * Ad Configuration Service
 * Manages system-wide ad settings, placement configuration, and governance
 */
export class AdConfigurationService {
	/**
	 * Get current system configuration
	 */
	async getSystemConfiguration(): Promise<AdSystemConfiguration> {
		// In a real implementation, this would come from a configuration table
		// For now, returning default configuration
		return {
			placements: {
				enabled: true,
				defaultFloorPrice: 0.5,
				maxDailyBudget: 10000,
				approvalRequired: true
			},
			targeting: {
				enablePersonalization: true,
				dataRetentionDays: 90,
				requireConsent: true,
				allowCrossSiteTracking: false
			},
			revenue: {
				platformCommission: 30, // 30% commission
				dgtRewardPool: 100000, // 100k DGT tokens
				minimumPayout: 10, // $10 minimum
				payoutSchedule: 'weekly'
			},
			content: {
				autoApproval: false,
				adultContentAllowed: false,
				cryptoContentOnly: true,
				requireDisclaimer: true
			},
			governance: {
				enableCommunityVoting: true,
				minimumTokensToVote: 1000, // 1000 DGT tokens
				votingPeriodDays: 7,
				quorumPercentage: 20 // 20% of token holders
			}
		};
	}

	/**
	 * Update system configuration (admin only)
	 */
	async updateSystemConfiguration(
		config: Partial<AdSystemConfiguration>,
		adminUserId: string
	): Promise<AdSystemConfiguration> {
		// TODO: Verify admin permissions

		// Create governance proposal for significant changes
		if (this.isSignificantChange(config)) {
			await this.createGovernanceProposal({
				title: 'Update Ad System Configuration',
				description: 'Proposed changes to advertising system configuration',
				proposerUserId: adminUserId,
				proposalType: 'ad_policy',
				proposedChanges: config,
				currentConfiguration: await this.getSystemConfiguration()
			});
		}

		// For now, return updated configuration
		// In production, this would be stored in database
		const currentConfig = await this.getSystemConfiguration();
		return { ...currentConfig, ...config };
	}

	/**
	 * Create ad placement
	 */
	async createPlacement(placement: PlacementConfiguration): Promise<AdPlacement> {
		// Validate placement configuration
		await this.validatePlacementConfig(placement);

		const [newPlacement] = await db
			.insert(adPlacements)
			.values({
				name: placement.name,
				slug: placement.slug,
				description: placement.description,
				position: placement.position,
				forumZoneSlug: placement.forumZoneSlug,
				forumSlug: placement.forumSlug,
				allowedFormats: placement.allowedFormats,
				dimensions: placement.dimensions,
				maxFileSize: placement.maxFileSize,
				floorPriceCpm: placement.floorPriceCpm.toString(),
				maxDailyImpressions: placement.maxDailyImpressions,
				priority: placement.priority,
				targetingConstraints: placement.targetingConstraints,
				displayRules: placement.displayRules,
				requiresApproval: placement.requiresApproval
			})
			.returning();

		return newPlacement;
	}

	/**
	 * Update ad placement
	 */
	async updatePlacement(
		placementId: string,
		updates: Partial<PlacementConfiguration>
	): Promise<AdPlacement> {
		const [updatedPlacement] = await db
			.update(adPlacements)
			.set({
				...updates,
				floorPriceCpm: updates.floorPriceCpm?.toString(),
				updatedAt: new Date()
			})
			.where(eq(adPlacements.id, placementId))
			.returning();

		if (!updatedPlacement) {
			throw new Error('Placement not found');
		}

		return updatedPlacement;
	}

	/**
	 * List all ad placements
	 */
	async listPlacements(
		filters: {
			position?: string;
			forumZoneSlug?: string;
			forumSlug?: string;
			isActive?: boolean;
		} = {}
	): Promise<AdPlacement[]> {
		let query = db.select().from(adPlacements);

		if (filters.position) {
			query = query.where(eq(adPlacements.position, filters.position as any));
		}

		if (filters.forumZoneSlug) {
			query = query.where(eq(adPlacements.forumZoneSlug, filters.forumZoneSlug));
		}

		if (filters.forumSlug) {
			query = query.where(eq(adPlacements.forumSlug, filters.forumSlug));
		}

		if (filters.isActive !== undefined) {
			query = query.where(eq(adPlacements.isActive, filters.isActive));
		}

		return await query.orderBy(asc(adPlacements.priority));
	}

	/**
	 * Delete ad placement
	 */
	async deletePlacement(placementId: string): Promise<void> {
		// Check if placement has active campaigns
		const activeCampaigns = await db
			.select({ count: sql<number>`count(*)` })
			.from(campaigns)
			.where(
				and(
					sql`${campaigns.placementRules}::jsonb ? ${placementId}`,
					eq(campaigns.status, 'active')
				)
			);

		if (activeCampaigns[0]?.count > 0) {
			throw new Error('Cannot delete placement with active campaigns');
		}

		await db.update(adPlacements).set({ isActive: false }).where(eq(adPlacements.id, placementId));
	}

	/**
	 * Create global rule
	 */
	async createGlobalRule(rule: GlobalRule): Promise<CampaignRule> {
		await this.validateRuleConfig(rule);

		const [newRule] = await db
			.insert(campaignRules)
			.values({
				name: rule.name,
				description: rule.description,
				campaignId: null, // Global rule
				ruleType: rule.ruleType,
				conditions: rule.conditions,
				actions: rule.actions,
				priority: rule.priority,
				isActive: rule.isActive,
				validFrom: rule.validFrom,
				validUntil: rule.validUntil
			})
			.returning();

		return newRule;
	}

	/**
	 * Update global rule
	 */
	async updateGlobalRule(ruleId: string, updates: Partial<GlobalRule>): Promise<CampaignRule> {
		const [updatedRule] = await db
			.update(campaignRules)
			.set({
				...updates,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(campaignRules.id, ruleId),
					sql`${campaignRules.campaignId} IS NULL` // Ensure it's a global rule
				)
			)
			.returning();

		if (!updatedRule) {
			throw new Error('Global rule not found');
		}

		return updatedRule;
	}

	/**
	 * List global rules
	 */
	async listGlobalRules(
		filters: {
			ruleType?: string;
			isActive?: boolean;
		} = {}
	): Promise<CampaignRule[]> {
		let query = db
			.select()
			.from(campaignRules)
			.where(sql`${campaignRules.campaignId} IS NULL`);

		if (filters.ruleType) {
			query = query.where(eq(campaignRules.ruleType, filters.ruleType));
		}

		if (filters.isActive !== undefined) {
			query = query.where(eq(campaignRules.isActive, filters.isActive));
		}

		return await query.orderBy(asc(campaignRules.priority));
	}

	/**
	 * Create governance proposal
	 */
	async createGovernanceProposal(proposal: {
		title: string;
		description: string;
		proposerUserId: string;
		proposalType: string;
		proposedChanges: any;
		currentConfiguration?: any;
	}): Promise<AdGovernanceProposal> {
		const votingStartAt = new Date();
		const votingEndAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		const [newProposal] = await db
			.insert(adGovernanceProposals)
			.values({
				title: proposal.title,
				description: proposal.description,
				proposerUserId: proposal.proposerUserId,
				proposalType: proposal.proposalType,
				proposedChanges: proposal.proposedChanges,
				currentConfiguration: proposal.currentConfiguration,
				votingStartAt,
				votingEndAt,
				status: 'active'
			})
			.returning();

		return newProposal;
	}

	/**
	 * Vote on governance proposal
	 */
	async voteOnProposal(
		proposalId: string,
		voterUserId: string,
		vote: 'for' | 'against' | 'abstain',
		votingPower: number,
		reason?: string
	): Promise<void> {
		// Check if proposal is active
		const [proposal] = await db
			.select()
			.from(adGovernanceProposals)
			.where(eq(adGovernanceProposals.id, proposalId))
			.limit(1);

		if (!proposal || proposal.status !== 'active') {
			throw new Error('Proposal not found or not active');
		}

		if (new Date() > proposal.votingEndAt) {
			throw new Error('Voting period has ended');
		}

		// Check if user already voted
		const existingVote = await db
			.select()
			.from(adGovernanceVotes)
			.where(
				and(
					eq(adGovernanceVotes.proposalId, proposalId),
					eq(adGovernanceVotes.voterUserId, voterUserId)
				)
			)
			.limit(1);

		if (existingVote.length > 0) {
			throw new Error('User has already voted on this proposal');
		}

		// Record vote
		await db.insert(adGovernanceVotes).values({
			proposalId,
			voterUserId,
			vote,
			votingPower: votingPower.toString(),
			voteReason: reason
		});

		// Update proposal vote tallies
		const increment = vote === 'for' ? 'votes_for' : vote === 'against' ? 'votes_against' : null;

		if (increment) {
			await db
				.update(adGovernanceProposals)
				.set({
					[increment]: sql`${adGovernanceProposals[increment as keyof typeof adGovernanceProposals]} + 1`,
					totalVotingPower: sql`${adGovernanceProposals.totalVotingPower} + ${votingPower}`
				})
				.where(eq(adGovernanceProposals.id, proposalId));
		}
	}

	/**
	 * Execute passed governance proposal
	 */
	async executeGovernanceProposal(proposalId: string): Promise<void> {
		const [proposal] = await db
			.select()
			.from(adGovernanceProposals)
			.where(eq(adGovernanceProposals.id, proposalId))
			.limit(1);

		if (!proposal) {
			throw new Error('Proposal not found');
		}

		// Check if proposal passed
		const totalVotes = proposal.votesFor + proposal.votesAgainst;
		const passingThreshold = totalVotes * 0.6; // 60% majority required

		if (proposal.votesFor < passingThreshold) {
			throw new Error('Proposal did not pass');
		}

		// Execute the changes
		try {
			await this.applyProposalChanges(proposal.proposedChanges, proposal.proposalType);

			// Mark as executed
			await db
				.update(adGovernanceProposals)
				.set({
					status: 'executed',
					executedAt: new Date(),
					executionResult: { success: true }
				})
				.where(eq(adGovernanceProposals.id, proposalId));
		} catch (error) {
			// Mark as failed
			await db
				.update(adGovernanceProposals)
				.set({
					status: 'rejected',
					executionResult: {
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error'
					}
				})
				.where(eq(adGovernanceProposals.id, proposalId));

			throw error;
		}
	}

	/**
	 * Get placement performance analytics
	 */
	async getPlacementAnalytics(
		placementId: string,
		timeRange?: { from: Date; to: Date }
	): Promise<{
		impressions: number;
		clicks: number;
		revenue: number;
		fillRate: number;
		averageCpm: number;
		topPerformingCampaigns: Array<{
			campaignId: string;
			campaignName: string;
			impressions: number;
			revenue: number;
		}>;
	}> {
		// This would be implemented with proper analytics queries
		// For now, returning mock data
		return {
			impressions: 150000,
			clicks: 3500,
			revenue: 2800.5,
			fillRate: 0.85,
			averageCpm: 1.87,
			topPerformingCampaigns: [
				{
					campaignId: 'campaign-1',
					campaignName: 'DeFi Platform Promo',
					impressions: 45000,
					revenue: 850.0
				}
			]
		};
	}

	/**
	 * Private helper methods
	 */
	private async validatePlacementConfig(placement: PlacementConfiguration): Promise<void> {
		if (!placement.name?.trim()) {
			throw new Error('Placement name is required');
		}

		if (!placement.slug?.trim()) {
			throw new Error('Placement slug is required');
		}

		// Check slug uniqueness
		const existing = await db
			.select()
			.from(adPlacements)
			.where(eq(adPlacements.slug, placement.slug))
			.limit(1);

		if (existing.length > 0 && existing[0].id !== placement.id) {
			throw new Error('Placement slug must be unique');
		}

		if (placement.floorPriceCpm < 0) {
			throw new Error('Floor price cannot be negative');
		}

		if (placement.priority < 1) {
			throw new Error('Priority must be at least 1');
		}
	}

	private async validateRuleConfig(rule: GlobalRule): Promise<void> {
		if (!rule.name?.trim()) {
			throw new Error('Rule name is required');
		}

		if (!rule.conditions || rule.conditions.length === 0) {
			throw new Error('At least one condition is required');
		}

		if (!rule.actions || rule.actions.length === 0) {
			throw new Error('At least one action is required');
		}

		// Validate condition structure
		for (const condition of rule.conditions) {
			if (!condition.field || !condition.operator || condition.value === undefined) {
				throw new Error('Each condition must have field, operator, and value');
			}
		}

		// Validate action structure
		for (const action of rule.actions) {
			if (!action.type) {
				throw new Error('Each action must have a type');
			}
		}
	}

	private isSignificantChange(config: Partial<AdSystemConfiguration>): boolean {
		// Define what constitutes a significant change requiring governance
		return !!(
			config.revenue?.platformCommission ||
			config.revenue?.dgtRewardPool ||
			config.content?.cryptoContentOnly ||
			config.governance
		);
	}

	private async applyProposalChanges(changes: any, proposalType: string): Promise<void> {
		// Apply configuration changes based on proposal type
		switch (proposalType) {
			case 'ad_policy':
				// Update system configuration
				break;
			case 'placement_rules':
				// Update placement rules
				break;
			case 'revenue_share':
				// Update revenue sharing configuration
				break;
			default:
				throw new Error(`Unknown proposal type: ${proposalType}`);
		}
	}
}

export const adConfigurationService = new AdConfigurationService();
