/**
 * Vanity Sink Analyzer
 *
 * Tracks DGT burning through vanity purchases for economic analysis
 * Provides real-time metrics on the vanity economy and token deflation
 * Essential for understanding user spending behavior and economic health
 */

import { logger, LogAction } from '@core/logger';
import { db } from '@degentalk/db';
import { transactions, userInventory, products } from '@schema';
import { eq, and, gte, lte, desc, sql, inArray } from 'drizzle-orm';
import { reportErrorServer } from "@lib/report-error";
import { toDgtAmount } from '@shared/types';
import type {
	VanitySinkMetrics,
	VanitySinkEvent,
	DgtAmount,
	UsdAmount,
	UserId,
	ItemId,
	OrderId,
	ItemCategory
} from '@shared/types/ids';

export interface VanitySinkConfig {
	trackingEnabled: boolean;
	realTimeUpdates: boolean;
	retentionDays: number;
	alertThresholds: {
		dailyBurnSpike: number;
		userSpendingLimit: number;
		deflationRate: number;
	};
}

export class VanitySinkAnalyzer {
	private config: VanitySinkConfig;
	private metrics: Map<string, VanitySinkMetrics> = new Map();
	private realTimeEvents: VanitySinkEvent[] = [];

	constructor(config: Partial<VanitySinkConfig> = {}) {
		this.config = {
			trackingEnabled: true,
			realTimeUpdates: true,
			retentionDays: 90,
			alertThresholds: {
				dailyBurnSpike: 50000, // DGT
				userSpendingLimit: 10000, // DGT per day
				deflationRate: 5 // % of supply
			},
			...config
		};
	}

	// ==========================================
	// BURN EVENT TRACKING
	// ==========================================

	/**
	 * Track a DGT burn event from vanity purchase
	 */
	async trackBurn(event: Omit<VanitySinkEvent, 'id' | 'timestamp'>): Promise<void> {
		if (!this.config.trackingEnabled) return;

		const burnEvent: VanitySinkEvent = {
			...event,
			id: this.generateEventId(),
			timestamp: new Date().toISOString()
		};

		try {
			// Store event for real-time tracking
			if (this.config.realTimeUpdates) {
				this.realTimeEvents.push(burnEvent);
				this.pruneRealTimeEvents();
			}

			// Log the burn event
			await this.logBurnEvent(burnEvent);

			// Check for alerts
			await this.checkBurnAlerts(burnEvent);

			logger.info('VanitySinkAnalyzer', 'DGT burn tracked', {
				eventId: burnEvent.id,
				userId: burnEvent.userId,
				dgtBurned: burnEvent.dgtBurned,
				burnType: burnEvent.burnType,
				source: burnEvent.source
			});
		} catch (error) {
			await reportErrorServer(error, {
				service: 'VanitySinkAnalyzer',
				operation: 'trackBurn',
				action: LogAction.FAILURE,
				data: { event: burnEvent }
			});
		}
	}

	/**
	 * Track shop purchase as vanity sink event
	 */
	async trackShopPurchase(params: {
		userId: UserId;
		orderId: OrderId;
		itemId: ItemId;
		dgtAmount: DgtAmount;
		itemCategory: ItemCategory;
		metadata?: Record<string, any>;
	}): Promise<void> {
		await this.trackBurn({
			userId: params.userId,
			itemId: params.itemId,
			orderId: params.orderId,
			dgtBurned: params.dgtAmount,
			burnType: 'purchase',
			source: 'shop',
			userLevel: await this.getUserLevel(params.userId),
			userLifetimeSpent: await this.getUserLifetimeSpent(params.userId),
			metadata: {
				...params.metadata,
				itemCategory: params.itemCategory,
				burnReason: 'cosmetic_purchase'
			}
		});
	}

	/**
	 * Track cosmetic upgrade/customization as burn event
	 */
	async trackCosmeticUpgrade(params: {
		userId: UserId;
		itemId: ItemId;
		dgtAmount: DgtAmount;
		upgradeType: 'color_change' | 'animation_unlock' | 'effect_enhance';
		metadata?: Record<string, any>;
	}): Promise<void> {
		await this.trackBurn({
			userId: params.userId,
			itemId: params.itemId,
			orderId: `upgrade_${Date.now()}` as OrderId,
			dgtBurned: params.dgtAmount,
			burnType: 'customization',
			source: 'game',
			userLevel: await this.getUserLevel(params.userId),
			userLifetimeSpent: await this.getUserLifetimeSpent(params.userId),
			metadata: {
				...params.metadata,
				upgradeType: params.upgradeType,
				burnReason: 'cosmetic_upgrade'
			}
		});
	}

	// ==========================================
	// METRICS GENERATION
	// ==========================================

	/**
	 * Generate comprehensive vanity sink metrics for a time period
	 */
	async generateSinkReport(params: {
		startDate: Date;
		endDate: Date;
		includeProjections?: boolean;
	}): Promise<VanitySinkMetrics> {
		try {
			logger.info('VanitySinkAnalyzer', 'Generating vanity sink report', {
				startDate: params.startDate.toISOString(),
				endDate: params.endDate.toISOString()
			});

			// Get burn transactions in period
			const burnTransactions = await this.getBurnTransactions(params.startDate, params.endDate);

			// Calculate core metrics
			const totalDgtBurned = this.calculateTotalBurned(burnTransactions);
			const totalTransactions = burnTransactions.length;
			const averageBurnPerTransaction =
				totalTransactions > 0
					? toDgtAmount(totalDgtBurned / totalTransactions)
					: toDgtAmount(0);

			// Generate category breakdown
			const burnByCategory = await this.generateCategoryBreakdown(burnTransactions);

			// Get top spenders
			const topSpenders = await this.getTopSpenders(params.startDate, params.endDate);

			// Calculate trends
			const burnTrend = await this.calculateBurnTrend(params.startDate, params.endDate);
			const projectedMonthlyBurn = params.includeProjections
				? await this.projectMonthlyBurn(burnTransactions)
				: toDgtAmount(0);

			// Economic impact calculations
			const burnUsdValue = this.calculateUsdValue(totalDgtBurned);
			const economicMultiplier = await this.calculateEconomicMultiplier(totalDgtBurned);
			const deflationaryPressure = await this.calculateDeflationaryPressure(totalDgtBurned);

			const metrics: VanitySinkMetrics = {
				periodStart: params.startDate.toISOString(),
				periodEnd: params.endDate.toISOString(),
				totalDgtBurned,
				totalTransactions,
				averageBurnPerTransaction,
				burnByCategory,
				topSpenders,
				burnTrend,
				projectedMonthlyBurn,
				burnVelocity: this.calculateBurnVelocity(totalDgtBurned, params.startDate, params.endDate),
				burnUsdValue,
				economicMultiplier,
				deflationaryPressure
			};

			// Cache metrics
			const cacheKey = `${params.startDate.toISOString()}_${params.endDate.toISOString()}`;
			this.metrics.set(cacheKey, metrics);

			logger.info('VanitySinkAnalyzer', 'Vanity sink report generated', {
				totalBurned: totalDgtBurned,
				totalTransactions,
				periodDays: (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24)
			});

			return metrics;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'VanitySinkAnalyzer',
				operation: 'generateSinkReport',
				action: LogAction.FAILURE,
				data: {
					startDate: params.startDate.toISOString(),
					endDate: params.endDate.toISOString(),
					includeProjections: params.includeProjections
				}
			});
			throw error;
		}
	}

	/**
	 * Get real-time burn metrics for dashboard
	 */
	async getRealTimeMetrics(): Promise<{
		last24h: Partial<VanitySinkMetrics>;
		last7d: Partial<VanitySinkMetrics>;
		currentMonth: Partial<VanitySinkMetrics>;
		liveEvents: VanitySinkEvent[];
	}> {
		const now = new Date();

		const [last24h, last7d, currentMonth] = await Promise.all([
			this.generateSinkReport({
				startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
				endDate: now
			}),
			this.generateSinkReport({
				startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
				endDate: now
			}),
			this.generateSinkReport({
				startDate: new Date(now.getFullYear(), now.getMonth(), 1),
				endDate: now,
				includeProjections: true
			})
		]);

		return {
			last24h,
			last7d,
			currentMonth,
			liveEvents: this.realTimeEvents.slice(-50) // Last 50 events
		};
	}

	/**
	 * Get top spending users for vanity items
	 */
	async getTopSpenders(
		startDate: Date,
		endDate: Date,
		limit: number = 10
	): Promise<
		Array<{
			userId: UserId;
			username: string;
			totalBurned: DgtAmount;
			transactionCount: number;
			favoriteCategory: ItemCategory;
		}>
	> {
		try {
			// Query top spenders from transactions
			const spenders = await db
				.select({
					userId: transactions.fromUserId,
					totalBurned: sql<number>`SUM(${transactions.amount})`,
					transactionCount: sql<number>`COUNT(*)`
				})
				.from(transactions)
				.where(
					and(
						eq(transactions.type, 'SHOP_PURCHASE'),
						gte(transactions.createdAt, startDate),
						lte(transactions.createdAt, endDate)
					)
				)
				.groupBy(transactions.fromUserId)
				.orderBy(desc(sql<number>`SUM(${transactions.amount})`))
				.limit(limit);

			// Enhance with user data and favorite categories
			const enhancedSpenders = await Promise.all(
				spenders.map(async (spender) => {
					const [userData, favoriteCategory] = await Promise.all([
						this.getUserData(spender.userId as UserId),
						this.getUserFavoriteCategory(spender.userId as UserId, startDate, endDate)
					]);

					return {
						userId: spender.userId as UserId,
						username: userData?.username || 'Unknown',
						totalBurned: toDgtAmount(spender.totalBurned),
						transactionCount: spender.transactionCount,
						favoriteCategory: favoriteCategory as ItemCategory
					};
				})
			);

			return enhancedSpenders;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'VanitySinkAnalyzer',
				operation: 'getTopSpenders',
				action: LogAction.FAILURE,
				data: {
					startDate: startDate.toISOString(),
					endDate: endDate.toISOString(),
					limit
				}
			});
			return [];
		}
	}

	// ==========================================
	// PRIVATE HELPER METHODS
	// ==========================================

	private generateEventId(): string {
		return `burn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private pruneRealTimeEvents(): void {
		// Keep only last 1000 events to prevent memory issues
		if (this.realTimeEvents.length > 1000) {
			this.realTimeEvents = this.realTimeEvents.slice(-1000);
		}
	}

	private async logBurnEvent(event: VanitySinkEvent): Promise<void> {
		// In a real implementation, this would store to a dedicated burn events table
		// For now, we'll use the existing transactions table metadata
		logger.debug('VanitySinkAnalyzer', 'Burn event logged', {
			eventId: event.id,
			burnType: event.burnType,
			dgtAmount: event.dgtBurned
		});
	}

	private async checkBurnAlerts(event: VanitySinkEvent): Promise<void> {
		// Check daily user spending
		const dailySpending = await this.getUserDailySpending(event.userId);
		if (dailySpending > this.config.alertThresholds.userSpendingLimit) {
			logger.warn('VanitySinkAnalyzer', 'High user spending detected', {
				userId: event.userId,
				dailySpending,
				threshold: this.config.alertThresholds.userSpendingLimit
			});
		}

		// Check for burn spikes
		const dailyBurn = await this.getDailyBurnTotal();
		if (dailyBurn > this.config.alertThresholds.dailyBurnSpike) {
			logger.warn('VanitySinkAnalyzer', 'Daily burn spike detected', {
				dailyBurn,
				threshold: this.config.alertThresholds.dailyBurnSpike
			});
		}
	}

	private async getBurnTransactions(startDate: Date, endDate: Date): Promise<any[]> {
		return await db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.type, 'SHOP_PURCHASE'),
					gte(transactions.createdAt, startDate),
					lte(transactions.createdAt, endDate)
				)
			)
			.orderBy(desc(transactions.createdAt));
	}

	private calculateTotalBurned(transactions: any[]): DgtAmount {
		return toDgtAmount(transactions.reduce((total, tx) => total + (tx.amount || 0), 0));
	}

	private async generateCategoryBreakdown(burnTransactions: any[]): Promise<any> {
		const breakdown: Record<string, any> = {};

		// Group transactions by item category
		for (const tx of burnTransactions) {
			const category = tx.metadata?.itemCategory || 'unknown';

			if (!breakdown[category]) {
				breakdown[category] = {
					amount: toDgtAmount(0),
					transactions: 0,
					topItems: []
				};
			}

			breakdown[category].amount += tx.amount || 0;
			breakdown[category].transactions += 1;
		}

		// Get top items for each category
		for (const category of Object.keys(breakdown)) {
			breakdown[category].topItems = await this.getTopItemsForCategory(category, burnTransactions);
		}

		return breakdown;
	}

	private async getTopItemsForCategory(category: string, transactions: any[]): Promise<any[]> {
		const itemTotals = new Map<string, { itemId: string; name: string; burned: number }>();

		for (const tx of transactions) {
			if (tx.metadata?.itemCategory === category && tx.metadata?.itemId) {
				const itemId = tx.metadata.itemId;
				const existing = itemTotals.get(itemId) || { itemId, name: 'Unknown', burned: 0 };
				existing.burned += tx.amount || 0;
				itemTotals.set(itemId, existing);
			}
		}

		return Array.from(itemTotals.values())
			.sort((a, b) => b.burned - a.burned)
			.slice(0, 5)
			.map((item) => ({
				itemId: item.itemId as ItemId,
				name: item.name,
				burned: toDgtAmount(item.burned)
			}));
	}

	private async calculateBurnTrend(
		startDate: Date,
		endDate: Date
	): Promise<'increasing' | 'stable' | 'decreasing'> {
		// Compare current period with previous period of same length
		const periodLength = endDate.getTime() - startDate.getTime();
		const previousStart = new Date(startDate.getTime() - periodLength);

		const [currentBurn, previousBurn] = await Promise.all([
			this.getBurnTransactions(startDate, endDate),
			this.getBurnTransactions(previousStart, startDate)
		]);

		const currentTotal = this.calculateTotalBurned(currentBurn);
		const previousTotal = this.calculateTotalBurned(previousBurn);

		if (currentTotal > previousTotal * 1.1) return 'increasing';
		if (currentTotal < previousTotal * 0.9) return 'decreasing';
		return 'stable';
	}

	private async projectMonthlyBurn(recentTransactions: any[]): Promise<DgtAmount> {
		if (recentTransactions.length === 0) return toDgtAmount(0);

		// Simple projection based on recent velocity
		const totalBurned = this.calculateTotalBurned(recentTransactions);
		const oldestTx = recentTransactions[recentTransactions.length - 1];
		const newestTx = recentTransactions[0];

		const periodDays =
			(new Date(newestTx.createdAt).getTime() - new Date(oldestTx.createdAt).getTime()) /
			(1000 * 60 * 60 * 24);
		const dailyBurnRate = periodDays > 0 ? totalBurned / periodDays : 0;

		return toDgtAmount(dailyBurnRate * 30); // 30-day projection
	}

	private calculateBurnVelocity(totalBurned: DgtAmount, startDate: Date, endDate: Date): number {
		const periodDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
		return periodDays > 0 ? totalBurned / periodDays : 0;
	}

	private calculateUsdValue(dgtAmount: DgtAmount): UsdAmount {
		const rate = parseFloat(process.env.DGT_USD_RATE || '0.01');
		return (dgtAmount * rate) as UsdAmount;
	}

	private async calculateEconomicMultiplier(burnedAmount: DgtAmount): Promise<number> {
		// Economic multiplier effect of DGT burning on circulation
		const totalSupply = await this.getTotalDgtSupply();
		const circulatingSupply = await this.getCirculatingDgtSupply();

		if (circulatingSupply === 0) return 1.0;

		// Simple multiplier calculation - reducing supply increases value pressure
		const burnRatio = burnedAmount / circulatingSupply;
		return 1 + burnRatio * 2; // Simplified multiplier
	}

	private async calculateDeflationaryPressure(burnedAmount: DgtAmount): Promise<number> {
		const circulatingSupply = await this.getCirculatingDgtSupply();
		if (circulatingSupply === 0) return 0;

		return (burnedAmount / circulatingSupply) * 100; // Percentage
	}

	private async getUserLevel(userId: UserId): Promise<number> {
		// This would integrate with the user service
		return 1; // Placeholder
	}

	private async getUserLifetimeSpent(userId: UserId): Promise<DgtAmount> {
		try {
			const result = await db
				.select({ total: sql<number>`SUM(${transactions.amount})` })
				.from(transactions)
				.where(and(eq(transactions.fromUserId, userId), eq(transactions.type, 'SHOP_PURCHASE')));

			return toDgtAmount(result[0]?.total || 0);
		} catch (error) {
			await reportErrorServer(error, {
				service: 'VanitySinkAnalyzer',
				operation: 'getUserLifetimeSpent',
				action: LogAction.FAILURE,
				data: { userId }
			});
			return toDgtAmount(0);
		}
	}

	private async getUserData(userId: UserId): Promise<{ username: string } | null> {
		// This would integrate with the user service
		return { username: `User_${userId}` }; // Placeholder
	}

	private async getUserFavoriteCategory(
		userId: UserId,
		startDate: Date,
		endDate: Date
	): Promise<string> {
		// This would analyze user's purchase patterns
		return 'avatar_frame'; // Placeholder
	}

	private async getUserDailySpending(userId: UserId): Promise<number> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

		try {
			const result = await db
				.select({ total: sql<number>`SUM(${transactions.amount})` })
				.from(transactions)
				.where(
					and(
						eq(transactions.fromUserId, userId),
						eq(transactions.type, 'SHOP_PURCHASE'),
						gte(transactions.createdAt, today),
						lte(transactions.createdAt, tomorrow)
					)
				);

			return result[0]?.total || 0;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'VanitySinkAnalyzer',
				operation: 'getUserDailySpending',
				action: LogAction.FAILURE,
				data: { userId }
			});
			return 0;
		}
	}

	private async getDailyBurnTotal(): Promise<number> {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

		try {
			const result = await db
				.select({ total: sql<number>`SUM(${transactions.amount})` })
				.from(transactions)
				.where(
					and(
						eq(transactions.type, 'SHOP_PURCHASE'),
						gte(transactions.createdAt, today),
						lte(transactions.createdAt, tomorrow)
					)
				);

			return result[0]?.total || 0;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'VanitySinkAnalyzer',
				operation: 'getDailyBurnTotal',
				action: LogAction.FAILURE,
				data: {}
			});
			return 0;
		}
	}

	private async getTotalDgtSupply(): Promise<number> {
		// This would integrate with token economics service
		return 1000000000; // Placeholder - 1B total supply
	}

	private async getCirculatingDgtSupply(): Promise<number> {
		// This would integrate with token economics service
		return 500000000; // Placeholder - 500M circulating
	}
}

// Export singleton instance
export const vanitySinkAnalyzer = new VanitySinkAnalyzer();
