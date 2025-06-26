import { eq, and, sql, desc, asc, gte, lte, isNull } from 'drizzle-orm';
import { db } from '@/core/database';
import {
	userPromotions,
	announcementSlots,
	shoutboxPins,
	threadBoosts,
	profileSpotlights,
	promotionPricingConfig,
	userPromotionAnalytics,
	wallets,
	transactions,
	type UserPromotion,
	type AnnouncementSlot,
	type ShoutboxPin,
	type ThreadBoost,
	type ProfileSpotlight
} from '@db/schema';

export interface CreatePromotionRequest {
	type:
		| 'thread_boost'
		| 'announcement_bar'
		| 'pinned_shoutbox'
		| 'profile_spotlight'
		| 'achievement_highlight';
	contentId?: string;
	title: string;
	description?: string;
	imageUrl?: string;
	linkUrl?: string;
	targetPlacement?: string;
	duration: string; // '1h', '6h', '1d', '3d', '1w'
	startTime?: Date;
	autoRenew?: boolean;
	maxDailySpend?: number;
	targetAudience?: any;
}

export interface PromotionCostCalculation {
	baseCost: number;
	demandMultiplier: number;
	timeMultiplier: number;
	totalCost: number;
	availableSlots: number;
	nextAvailableTime?: Date;
}

export interface AvailableSlot {
	id: string;
	slotNumber: number;
	priority: string;
	date: Date;
	hourStart: number;
	hourEnd: number;
	price: number;
	isAvailable: boolean;
}

/**
 * User Promotion Service
 * Handles DGT-powered user content promotion system
 */
export class UserPromotionService {
	/**
	 * Create a new user promotion
	 */
	async createPromotion(
		userId: string,
		request: CreatePromotionRequest
	): Promise<{
		promotion: UserPromotion;
		costBreakdown: PromotionCostCalculation;
		paymentRequired: boolean;
	}> {
		// 1. Validate user has sufficient DGT balance
		const userWallet = await this.getUserDgtBalance(userId);
		if (!userWallet) {
			throw new Error('User wallet not found');
		}

		// 2. Calculate promotion cost
		const costCalculation = await this.calculatePromotionCost(
			request.type,
			request.duration,
			request.startTime || new Date()
		);

		if (parseFloat(userWallet.dgtBalance) < costCalculation.totalCost) {
			throw new Error(
				`Insufficient DGT balance. Required: ${costCalculation.totalCost}, Available: ${userWallet.dgtBalance}`
			);
		}

		// 3. Check slot availability for announcement/pin requests
		if (request.type === 'announcement_bar') {
			const availableSlots = await this.getAvailableAnnouncementSlots(
				request.startTime || new Date(),
				this.parseDurationToHours(request.duration)
			);

			if (availableSlots.length === 0) {
				throw new Error('No announcement slots available for the requested time period');
			}
		}

		// 4. Calculate start and end times
		const startTime = request.startTime || new Date();
		const durationHours = this.parseDurationToHours(request.duration);
		const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

		// 5. Create promotion record
		const [promotion] = await db
			.insert(userPromotions)
			.values({
				userId,
				type: request.type,
				contentId: request.contentId,
				title: request.title,
				description: request.description,
				imageUrl: request.imageUrl,
				linkUrl: request.linkUrl,
				targetPlacement: request.targetPlacement,
				startTime,
				endTime,
				duration: durationHours,
				dgtCost: costCalculation.totalCost.toString(),
				status: 'pending', // Requires approval for most types
				autoRenew: request.autoRenew || false,
				maxDailySpend: request.maxDailySpend?.toString(),
				targetAudience: request.targetAudience ? JSON.stringify(request.targetAudience) : null
			})
			.returning();

		// 6. Hold DGT funds (create pending transaction)
		await this.holdDgtFunds(userId, costCalculation.totalCost, promotion.id);

		// 7. Auto-approve certain low-risk promotion types
		const autoApproveTypes = ['thread_boost'];
		if (autoApproveTypes.includes(request.type)) {
			await this.approvePromotion(
				promotion.id,
				'system',
				'Auto-approved for low-risk promotion type'
			);
		}

		return {
			promotion,
			costBreakdown: costCalculation,
			paymentRequired: true
		};
	}

	/**
	 * Calculate promotion cost with dynamic pricing
	 */
	async calculatePromotionCost(
		type: string,
		duration: string,
		targetTime: Date
	): Promise<PromotionCostCalculation> {
		// Get base pricing configuration
		const [pricingConfig] = await db
			.select()
			.from(promotionPricingConfig)
			.where(
				and(
					eq(promotionPricingConfig.promotionType, type),
					eq(promotionPricingConfig.duration, duration),
					eq(promotionPricingConfig.isActive, true)
				)
			)
			.limit(1);

		if (!pricingConfig) {
			throw new Error(`No pricing configuration found for ${type} with duration ${duration}`);
		}

		const baseCost = parseFloat(pricingConfig.basePriceDgt);

		// Calculate demand multiplier based on current bookings
		const demandMultiplier = await this.calculateDemandMultiplier(type, targetTime);

		// Calculate time-based multiplier (peak hours, weekends)
		const timeMultiplier = this.calculateTimeMultiplier(targetTime, pricingConfig);

		// Calculate final cost
		const totalCost = Math.max(
			baseCost * demandMultiplier * timeMultiplier,
			parseFloat(pricingConfig.minPrice)
		);

		// Check available slots
		const availableSlots = await this.getAvailableSlotsCount(type, targetTime);

		return {
			baseCost,
			demandMultiplier,
			timeMultiplier,
			totalCost: Math.ceil(totalCost), // Round up to nearest DGT
			availableSlots,
			nextAvailableTime:
				availableSlots === 0 ? await this.getNextAvailableTime(type, targetTime) : undefined
		};
	}

	/**
	 * Approve a user promotion
	 */
	async approvePromotion(promotionId: string, moderatorId: string, notes?: string): Promise<void> {
		// Update promotion status
		const [promotion] = await db
			.update(userPromotions)
			.set({
				status: 'approved',
				moderatorId,
				moderatorNotes: notes,
				approvedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(userPromotions.id, promotionId))
			.returning();

		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Convert held funds to actual payment
		await this.processPromotionPayment(
			promotion.userId,
			parseFloat(promotion.dgtCost),
			promotionId
		);

		// Create specific promotion records based on type
		await this.createSpecificPromotionRecord(promotion);

		// If start time is now or in the past, activate immediately
		if (promotion.startTime <= new Date()) {
			await this.activatePromotion(promotionId);
		}
	}

	/**
	 * Reject a user promotion
	 */
	async rejectPromotion(promotionId: string, moderatorId: string, reason: string): Promise<void> {
		const [promotion] = await db
			.update(userPromotions)
			.set({
				status: 'rejected',
				moderatorId,
				rejectionReason: reason,
				updatedAt: new Date()
			})
			.where(eq(userPromotions.id, promotionId))
			.returning();

		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Release held DGT funds
		await this.releaseDgtFunds(promotion.userId, parseFloat(promotion.dgtCost), promotionId);
	}

	/**
	 * Activate an approved promotion
	 */
	async activatePromotion(promotionId: string): Promise<void> {
		await db
			.update(userPromotions)
			.set({
				status: 'active',
				activatedAt: new Date(),
				updatedAt: new Date()
			})
			.where(eq(userPromotions.id, promotionId));
	}

	/**
	 * Get user's promotions
	 */
	async getUserPromotions(
		userId: string,
		filters: {
			status?: string;
			type?: string;
			limit?: number;
			offset?: number;
		} = {}
	): Promise<{
		promotions: UserPromotion[];
		total: number;
	}> {
		let query = db.select().from(userPromotions).where(eq(userPromotions.userId, userId));

		if (filters.status) {
			query = query.where(eq(userPromotions.status, filters.status));
		}

		if (filters.type) {
			query = query.where(eq(userPromotions.type, filters.type));
		}

		const promotions = await query
			.orderBy(desc(userPromotions.createdAt))
			.limit(filters.limit || 20)
			.offset(filters.offset || 0);

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(userPromotions)
			.where(eq(userPromotions.userId, userId));

		return {
			promotions,
			total: count
		};
	}

	/**
	 * Get pending promotions for moderation
	 */
	async getPendingPromotions(
		filters: {
			type?: string;
			limit?: number;
			offset?: number;
		} = {}
	): Promise<UserPromotion[]> {
		let query = db.select().from(userPromotions).where(eq(userPromotions.status, 'pending'));

		if (filters.type) {
			query = query.where(eq(userPromotions.type, filters.type));
		}

		return await query
			.orderBy(asc(userPromotions.createdAt))
			.limit(filters.limit || 50)
			.offset(filters.offset || 0);
	}

	/**
	 * Get available announcement slots
	 */
	async getAvailableAnnouncementSlots(
		startTime: Date,
		durationHours: number
	): Promise<AvailableSlot[]> {
		const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

		// Get all slots in the time range that are not booked
		const availableSlots = await db
			.select()
			.from(announcementSlots)
			.where(
				and(
					gte(announcementSlots.date, startTime.toISOString().split('T')[0]),
					lte(announcementSlots.date, endTime.toISOString().split('T')[0]),
					eq(announcementSlots.isBooked, false)
				)
			)
			.orderBy(asc(announcementSlots.slotNumber), asc(announcementSlots.hourStart));

		return availableSlots.map((slot) => ({
			id: slot.id,
			slotNumber: slot.slotNumber,
			priority: slot.priority,
			date: slot.date,
			hourStart: slot.hourStart,
			hourEnd: slot.hourEnd,
			price: parseFloat(slot.currentPrice),
			isAvailable: true
		}));
	}

	/**
	 * Reserve announcement slot
	 */
	async reserveAnnouncementSlot(
		slotId: string,
		promotionId: string,
		userId: string
	): Promise<void> {
		await db
			.update(announcementSlots)
			.set({
				userPromotionId: promotionId,
				bookedByUserId: userId,
				isBooked: true,
				bookedAt: new Date(),
				updatedAt: new Date()
			})
			.where(and(eq(announcementSlots.id, slotId), eq(announcementSlots.isBooked, false)));
	}

	/**
	 * Get active pinned shoutbox messages
	 */
	async getActivePinnedMessages(): Promise<ShoutboxPin[]> {
		const now = new Date();

		return await db
			.select()
			.from(shoutboxPins)
			.where(
				and(
					eq(shoutboxPins.isActive, true),
					lte(shoutboxPins.startTime, now),
					gte(shoutboxPins.endTime, now)
				)
			)
			.orderBy(desc(shoutboxPins.startTime));
	}

	/**
	 * Track promotion performance
	 */
	async trackPromotionEvent(
		promotionId: string,
		eventType: 'impression' | 'click' | 'conversion',
		metadata?: any
	): Promise<void> {
		// Update main promotion record
		const updateField =
			eventType === 'impression' ? 'impressions' : eventType === 'click' ? 'clicks' : 'conversions';

		await db
			.update(userPromotions)
			.set({
				[updateField]: sql`${userPromotions[updateField]} + 1`,
				updatedAt: new Date()
			})
			.where(eq(userPromotions.id, promotionId));

		// Create analytics record for detailed tracking
		const today = new Date().toISOString().split('T')[0];
		const currentHour = new Date().getHours();

		await db
			.insert(userPromotionAnalytics)
			.values({
				userPromotionId: promotionId,
				date: today,
				hour: currentHour,
				[updateField]: 1
			})
			.onConflictDoUpdate({
				target: [
					userPromotionAnalytics.userPromotionId,
					userPromotionAnalytics.date,
					userPromotionAnalytics.hour
				],
				set: {
					[updateField]: sql`${userPromotionAnalytics[updateField]} + 1`,
					updatedAt: new Date()
				}
			});
	}

	/**
	 * Get promotion analytics
	 */
	async getPromotionAnalytics(
		promotionId: string,
		timeRange?: { from: Date; to: Date }
	): Promise<{
		totalImpressions: number;
		totalClicks: number;
		totalConversions: number;
		ctr: number;
		conversionRate: number;
		totalSpent: number;
		averageCPC: number;
		dailyBreakdown: Array<{
			date: string;
			impressions: number;
			clicks: number;
			conversions: number;
			spent: number;
		}>;
	}> {
		// Get overall statistics
		const [promotion] = await db
			.select()
			.from(userPromotions)
			.where(eq(userPromotions.id, promotionId))
			.limit(1);

		if (!promotion) {
			throw new Error('Promotion not found');
		}

		// Get daily breakdown
		let analyticsQuery = db
			.select()
			.from(userPromotionAnalytics)
			.where(eq(userPromotionAnalytics.userPromotionId, promotionId));

		if (timeRange) {
			analyticsQuery = analyticsQuery.where(
				and(
					gte(userPromotionAnalytics.date, timeRange.from.toISOString().split('T')[0]),
					lte(userPromotionAnalytics.date, timeRange.to.toISOString().split('T')[0])
				)
			);
		}

		const dailyAnalytics = await analyticsQuery.orderBy(asc(userPromotionAnalytics.date));

		// Calculate aggregated metrics
		const totalImpressions = promotion.impressions;
		const totalClicks = promotion.clicks;
		const totalConversions = promotion.conversions;
		const totalSpent = parseFloat(promotion.dgtSpent);

		const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
		const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
		const averageCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;

		// Format daily breakdown
		const dailyBreakdown = dailyAnalytics.map((day) => ({
			date: day.date,
			impressions: day.impressions,
			clicks: day.clicks,
			conversions: day.conversions,
			spent: parseFloat(day.dgtSpent)
		}));

		return {
			totalImpressions,
			totalClicks,
			totalConversions,
			ctr: Math.round(ctr * 100) / 100,
			conversionRate: Math.round(conversionRate * 100) / 100,
			totalSpent,
			averageCPC: Math.round(averageCPC * 100) / 100,
			dailyBreakdown
		};
	}

	/**
	 * Private helper methods
	 */
	private async getUserDgtBalance(userId: string): Promise<{ dgtBalance: string } | null> {
		const [wallet] = await db
			.select({ dgtBalance: wallets.dgtBalance })
			.from(wallets)
			.where(eq(wallets.userId, userId))
			.limit(1);

		return wallet || null;
	}

	private parseDurationToHours(duration: string): number {
		const durationMap: { [key: string]: number } = {
			'1h': 1,
			'6h': 6,
			'12h': 12,
			'1d': 24,
			'3d': 72,
			'1w': 168
		};

		return durationMap[duration] || 24; // Default to 1 day
	}

	private async calculateDemandMultiplier(type: string, targetTime: Date): Promise<number> {
		// Get current demand for the time period
		const startOfDay = new Date(targetTime);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(targetTime);
		endOfDay.setHours(23, 59, 59, 999);

		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(userPromotions)
			.where(
				and(
					eq(userPromotions.type, type),
					eq(userPromotions.status, 'active'),
					gte(userPromotions.startTime, startOfDay),
					lte(userPromotions.startTime, endOfDay)
				)
			);

		// Base multiplier starts at 1.0, increases by 0.1 for each active promotion
		return Math.max(1.0, 1.0 + count * 0.1);
	}

	private calculateTimeMultiplier(targetTime: Date, pricingConfig: any): number {
		const hour = targetTime.getHours();
		const dayOfWeek = targetTime.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

		let multiplier = 1.0;

		// Apply weekend multiplier
		if (isWeekend) {
			multiplier *= parseFloat(pricingConfig.weekendMultiplier);
		}

		// Apply peak hour multiplier
		const peakHours = JSON.parse(pricingConfig.peakHours || '[18,19,20,21]');
		if (peakHours.includes(hour)) {
			multiplier *= parseFloat(pricingConfig.peakMultiplier);
		}

		return multiplier;
	}

	private async getAvailableSlotsCount(type: string, targetTime: Date): Promise<number> {
		if (type === 'announcement_bar') {
			const [{ count }] = await db
				.select({ count: sql<number>`count(*)` })
				.from(announcementSlots)
				.where(
					and(
						eq(announcementSlots.date, targetTime.toISOString().split('T')[0]),
						eq(announcementSlots.isBooked, false)
					)
				);
			return count;
		}

		// For other types, return a high number as slots are virtually unlimited
		return 100;
	}

	private async getNextAvailableTime(type: string, targetTime: Date): Promise<Date | undefined> {
		if (type === 'announcement_bar') {
			const nextSlot = await db
				.select()
				.from(announcementSlots)
				.where(
					and(
						gte(announcementSlots.date, targetTime.toISOString().split('T')[0]),
						eq(announcementSlots.isBooked, false)
					)
				)
				.orderBy(asc(announcementSlots.date), asc(announcementSlots.hourStart))
				.limit(1);

			if (nextSlot.length > 0) {
				const slot = nextSlot[0];
				const nextTime = new Date(slot.date);
				nextTime.setHours(slot.hourStart, 0, 0, 0);
				return nextTime;
			}
		}

		return undefined;
	}

	private async holdDgtFunds(userId: string, amount: number, promotionId: string): Promise<void> {
		// Create a pending transaction to hold the funds
		await db.insert(transactions).values({
			userId,
			type: 'promotion_hold',
			amount: amount.toString(),
			currency: 'DGT',
			status: 'pending',
			metadata: { promotionId, type: 'user_promotion_hold' },
			description: `DGT held for user promotion ${promotionId}`
		});
	}

	private async processPromotionPayment(
		userId: string,
		amount: number,
		promotionId: string
	): Promise<void> {
		// Deduct DGT from user wallet
		await db
			.update(wallets)
			.set({
				dgtBalance: sql`${wallets.dgtBalance} - ${amount}`,
				updatedAt: new Date()
			})
			.where(eq(wallets.userId, userId));

		// Create completed transaction
		await db.insert(transactions).values({
			userId,
			type: 'promotion_payment',
			amount: amount.toString(),
			currency: 'DGT',
			status: 'completed',
			metadata: { promotionId, type: 'user_promotion_payment' },
			description: `DGT payment for user promotion ${promotionId}`
		});

		// Update promotion spent amount
		await db
			.update(userPromotions)
			.set({
				dgtSpent: amount.toString(),
				updatedAt: new Date()
			})
			.where(eq(userPromotions.id, promotionId));
	}

	private async releaseDgtFunds(
		userId: string,
		amount: number,
		promotionId: string
	): Promise<void> {
		// Mark hold transaction as cancelled
		await db
			.update(transactions)
			.set({
				status: 'cancelled',
				updatedAt: new Date()
			})
			.where(
				and(
					eq(transactions.userId, userId),
					eq(transactions.type, 'promotion_hold'),
					sql`${transactions.metadata}::jsonb ->> 'promotionId' = ${promotionId}`
				)
			);
	}

	private async createSpecificPromotionRecord(promotion: UserPromotion): Promise<void> {
		switch (promotion.type) {
			case 'thread_boost':
				if (promotion.contentId) {
					await db.insert(threadBoosts).values({
						userPromotionId: promotion.id,
						threadId: promotion.contentId,
						userId: promotion.userId,
						startTime: promotion.startTime,
						endTime: promotion.endTime,
						boostMultiplier: '2.0',
						priorityLevel: 1
					});
				}
				break;

			case 'pinned_shoutbox':
				await db.insert(shoutboxPins).values({
					userPromotionId: promotion.id,
					userId: promotion.userId,
					content: promotion.description || promotion.title,
					imageUrl: promotion.imageUrl,
					linkUrl: promotion.linkUrl,
					startTime: promotion.startTime,
					endTime: promotion.endTime
				});
				break;

			case 'profile_spotlight':
				await db.insert(profileSpotlights).values({
					userPromotionId: promotion.id,
					userId: promotion.userId,
					spotlightMessage: promotion.description || promotion.title,
					startTime: promotion.startTime,
					endTime: promotion.endTime
				});
				break;
		}
	}
}

export const userPromotionService = new UserPromotionService();
