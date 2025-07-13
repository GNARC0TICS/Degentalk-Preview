/**
 * Shop Transformer
 *
 * Security-first data transformation for shop and cosmetics
 * Implements three-tier access: Public → Authenticated → Admin
 * Follows established patterns from Users, Forums, and Economy domains
 */

import type { UserId } from '@shared/types/ids';
import type {
	PublicShopItem,
	AuthenticatedShopItem,
	AdminShopItem,
	UserOrder,
	AdminOrder,
	UserInventoryItem,
	AdminInventoryItem,
	VanitySinkMetrics,
	VanitySinkEvent
} from '../types';

import type {
	ItemId,
	DgtAmount,
	UsdAmount,
	ItemRarity,
	ItemCategory,
	OrderId,
	InventoryItemId
} from '@shared/types/ids';

import { UserTransformer } from '../../users/transformers/user.transformer';
import { createHash } from 'crypto';

export class ShopTransformer {
	// ==========================================
	// SHOP ITEM TRANSFORMERS
	// ==========================================

	/**
	 * Transform shop item for public view (catalog browsing)
	 * Shows basic product information without user-specific data
	 */
	static toPublicShopItem(dbItem: any): PublicShopItem {
		return {
			id: dbItem.id as ItemId,
			name: dbItem.name,
			description: dbItem.description || '',
			category: dbItem.category as ItemCategory,
			rarity: dbItem.rarity as ItemRarity,

			// Pricing information
			price: this.sanitizeDgtAmount(dbItem.price),
			originalPrice: dbItem.originalPrice
				? this.sanitizeDgtAmount(dbItem.originalPrice)
				: undefined,
			discountPercentage: this.calculateDiscountPercentage(dbItem.price, dbItem.originalPrice),

			// Visual metadata
			previewUrl: dbItem.previewUrl || this.generatePreviewUrl(dbItem),
			thumbnailUrl: dbItem.thumbnailUrl || this.generateThumbnailUrl(dbItem),
			rarityColor: this.getRarityColor(dbItem.rarity),
			rarityGlow: this.getRarityGlow(dbItem.rarity),

			// Availability
			isAvailable: this.isItemAvailable(dbItem),
			isLimited: dbItem.isLimited === true,
			stockRemaining: dbItem.isLimited ? dbItem.stockRemaining || 0 : undefined,
			releaseDate: dbItem.releaseDate?.toISOString(),
			expiryDate: dbItem.expiryDate?.toISOString(),

			// Public metrics
			popularityScore: this.calculatePopularityScore(dbItem),
			tags: dbItem.tags || []
		};
	}

	/**
	 * Transform shop item for authenticated users
	 * Adds purchase permissions and user-specific context
	 */
	static toAuthenticatedShopItem(
		dbItem: any,
		requestingUser: any,
		userInventory?: any[]
	): AuthenticatedShopItem {
		const publicData = this.toPublicShopItem(dbItem);

		// Calculate user-specific purchase context
		const userDgtBalance = this.sanitizeDgtAmount(requestingUser.dgtBalance || 0);
		const requiredDgt = publicData.price;
		const canAfford = userDgtBalance >= requiredDgt;
		const alreadyOwned = this.checkUserOwnership(dbItem.id, userInventory);
		const ownedQuantity = this.getUserItemQuantity(dbItem.id, userInventory);

		return {
			...publicData,

			// User-specific purchase data
			canPurchase: this.canUserPurchase(dbItem, requestingUser, alreadyOwned),
			canAfford,
			alreadyOwned,

			// Purchase context
			userDgtBalance,
			requiredDgt,
			dgtShortfall: canAfford ? undefined : ((requiredDgt - userDgtBalance) as DgtAmount),

			// Ownership tracking
			ownedQuantity,
			maxQuantity: dbItem.maxQuantityPerUser || undefined,

			// Enhanced user experience
			similarItems: this.getSimilarItems(dbItem, requestingUser),
			bundleOpportunities: this.getBundleOpportunities(dbItem, userInventory),

			// Preview permissions
			canPreview: this.canUserPreview(dbItem, requestingUser),
			previewUrl: this.getEnhancedPreviewUrl(dbItem, requestingUser)
		};
	}

	/**
	 * Transform shop item for admin view
	 * Includes comprehensive analytics and management data
	 */
	static toAdminShopItem(dbItem: any, analytics?: any): AdminShopItem {
		// Get authenticated data with admin permissions
		const authenticatedData = this.toAuthenticatedShopItem(dbItem, { role: 'admin', id: 'admin' });

		return {
			...authenticatedData,

			// Financial metrics
			totalRevenue: this.sanitizeDgtAmount(analytics?.totalRevenue || 0),
			totalSales: analytics?.totalSales || 0,
			revenueUsd: this.calculateUsdValue(analytics?.totalRevenue || 0),
			averageSalePrice: this.calculateAverageSalePrice(analytics),

			// Analytics
			viewCount: analytics?.viewCount || 0,
			conversionRate: this.calculateConversionRate(analytics),
			popularityTrend: this.determinePopularityTrend(analytics),
			lastPurchaseAt: analytics?.lastPurchaseAt?.toISOString(),

			// Inventory management
			totalStock: dbItem.totalStock || undefined,
			stockAlerts: this.shouldShowStockAlerts(dbItem),
			replenishmentNeeded: this.isReplenishmentNeeded(dbItem),

			// Content management
			createdAt: dbItem.createdAt.toISOString(),
			updatedAt: dbItem.updatedAt.toISOString(),
			createdBy: dbItem.createdBy as UserId,
			lastModifiedBy: (dbItem.lastModifiedBy as UserId) || undefined,

			// Status tracking
			isActive: dbItem.isActive !== false,
			isFeatured: dbItem.isFeatured === true,
			isPromoted: dbItem.isPromoted === true,
			moderationStatus: dbItem.moderationStatus || 'approved',

			// Performance insights
			topBuyers: this.getTopBuyers(analytics),

			// A/B testing
			experimentId: dbItem.experimentId || undefined,
			conversionVariant: dbItem.conversionVariant || undefined
		};
	}

	// ==========================================
	// ORDER TRANSFORMERS
	// ==========================================

	/**
	 * Transform order for user view
	 */
	static toUserOrder(dbOrder: any, orderItems?: any[]): UserOrder {
		return {
			id: dbOrder.id as OrderId,
			userId: dbOrder.userId as UserId,

			// Order details
			status: dbOrder.status,
			totalAmount: this.sanitizeDgtAmount(dbOrder.totalAmount),
			totalUsd: dbOrder.totalUsd ? this.sanitizeUsdAmount(dbOrder.totalUsd) : undefined,
			paymentMethod: dbOrder.paymentMethod || 'dgt',

			// Items
			items: (orderItems || []).map((item) => ({
				itemId: item.itemId as ItemId,
				name: item.name,
				quantity: item.quantity,
				unitPrice: this.sanitizeDgtAmount(item.unitPrice),
				totalPrice: this.sanitizeDgtAmount(item.totalPrice)
			})),

			// Timestamps
			createdAt: dbOrder.createdAt.toISOString(),
			completedAt: dbOrder.completedAt?.toISOString(),

			// Transaction tracking
			transactionId: dbOrder.transactionId || undefined,

			// Refund permissions
			canRefund: this.canOrderBeRefunded(dbOrder),
			refundDeadline: this.getRefundDeadline(dbOrder)?.toISOString()
		};
	}

	/**
	 * Transform order for admin view
	 */
	static toAdminOrder(dbOrder: any, user?: any, analytics?: any): AdminOrder {
		const userData = this.toUserOrder(dbOrder);

		return {
			...userData,

			// User context
			user: {
				id: user?.id as UserId,
				username: user?.username,
				email: this.anonymizeEmail(user?.email),
				totalLifetimeValue: this.sanitizeDgtAmount(user?.totalLifetimeValue || 0),
				orderCount: user?.orderCount || 0
			},

			// Financial analysis
			revenueImpact: this.sanitizeDgtAmount(analytics?.revenueImpact || dbOrder.totalAmount),
			marginAnalysis: analytics?.marginAnalysis
				? {
						cost: this.sanitizeDgtAmount(analytics.marginAnalysis.cost),
						margin: this.sanitizeDgtAmount(analytics.marginAnalysis.margin),
						marginPercent: analytics.marginAnalysis.marginPercent
					}
				: undefined,

			// System data (anonymized for GDPR)
			ipAddress: this.anonymizeIP(dbOrder.ipAddress),
			userAgent: dbOrder.userAgent,
			processingTime: dbOrder.processingTime,

			// Marketing analytics
			conversionSource: dbOrder.conversionSource,
			campaignId: dbOrder.campaignId,
			referrer: dbOrder.referrer,

			// Risk management
			riskScore: this.calculateOrderRiskScore(dbOrder),
			flaggedForReview: dbOrder.flaggedForReview === true,
			fraudScore: analytics?.fraudScore,

			// Administration
			notes: dbOrder.notes,
			lastReviewedBy: (dbOrder.lastReviewedBy as UserId) || undefined,
			lastReviewedAt: dbOrder.lastReviewedAt?.toISOString()
		};
	}

	// ==========================================
	// INVENTORY TRANSFORMERS
	// ==========================================

	/**
	 * Transform inventory item for user view
	 */
	static toUserInventoryItem(dbInventoryItem: any): UserInventoryItem {
		return {
			id: dbInventoryItem.id as InventoryItemId,
			itemId: dbInventoryItem.itemId as ItemId,
			userId: dbInventoryItem.userId as UserId,

			// Item details
			name: dbInventoryItem.name,
			category: dbInventoryItem.category as ItemCategory,
			rarity: dbInventoryItem.rarity as ItemRarity,
			type: dbInventoryItem.type,

			// Ownership data
			quantity: dbInventoryItem.quantity || 1,
			acquiredAt: dbInventoryItem.acquiredAt.toISOString(),
			purchasePrice: dbInventoryItem.purchasePrice
				? this.sanitizeDgtAmount(dbInventoryItem.purchasePrice)
				: undefined,
			source: dbInventoryItem.source || 'purchase',

			// Equipment status
			isEquipped: dbInventoryItem.isEquipped === true,
			equippedAt: dbInventoryItem.equippedAt?.toISOString(),
			equipSlot: dbInventoryItem.equipSlot,

			// Item state
			condition: dbInventoryItem.condition || 'new',
			usageCount: dbInventoryItem.usageCount || 0,

			// Metadata
			metadata: dbInventoryItem.metadata || {},
			customizations: dbInventoryItem.customizations || {}
		};
	}

	/**
	 * Transform inventory item for admin view
	 */
	static toAdminInventoryItem(
		dbInventoryItem: any,
		user?: any,
		analytics?: any
	): AdminInventoryItem {
		const userItem = this.toUserInventoryItem(dbInventoryItem);

		return {
			...userItem,

			// User context
			user: {
				id: user?.id as UserId,
				username: user?.username,
				level: user?.level || 1,
				totalSpent: this.sanitizeDgtAmount(user?.totalSpent || 0)
			},

			// Analytics
			lastUsed: analytics?.lastUsed?.toISOString(),
			usageFrequency: analytics?.usageFrequency || 0,

			// Value tracking
			currentMarketValue: analytics?.currentMarketValue
				? this.sanitizeDgtAmount(analytics.currentMarketValue)
				: undefined,
			valueAppreciation: analytics?.valueAppreciation,

			// System tracking
			grantedBy: (dbInventoryItem.grantedBy as UserId) || undefined,
			grantReason: dbInventoryItem.grantReason,

			// Status
			isFlagged: dbInventoryItem.isFlagged === true,
			flagReason: dbInventoryItem.flagReason
		};
	}

	// ==========================================
	// VANITY SINK ANALYTICS
	// ==========================================

	/**
	 * Transform vanity sink metrics for admin dashboard
	 */
	static toVanitySinkMetrics(analyticsData: any): VanitySinkMetrics {
		return {
			periodStart: analyticsData.periodStart.toISOString(),
			periodEnd: analyticsData.periodEnd.toISOString(),

			// Burn statistics
			totalDgtBurned: this.sanitizeDgtAmount(analyticsData.totalDgtBurned),
			totalTransactions: analyticsData.totalTransactions,
			averageBurnPerTransaction: this.sanitizeDgtAmount(analyticsData.averageBurnPerTransaction),

			// Category breakdown
			burnByCategory: this.transformBurnByCategory(analyticsData.burnByCategory),

			// User behavior
			topSpenders: analyticsData.topSpenders.map((spender: any) => ({
				userId: spender.userId as UserId,
				username: spender.username,
				totalBurned: this.sanitizeDgtAmount(spender.totalBurned),
				transactionCount: spender.transactionCount,
				favoriteCategory: spender.favoriteCategory as ItemCategory
			})),

			// Trends
			burnTrend: analyticsData.burnTrend,
			projectedMonthlyBurn: this.sanitizeDgtAmount(analyticsData.projectedMonthlyBurn),
			burnVelocity: analyticsData.burnVelocity,

			// Economic impact
			burnUsdValue: this.calculateUsdValue(analyticsData.totalDgtBurned),
			economicMultiplier: analyticsData.economicMultiplier || 1.0,
			deflationaryPressure: analyticsData.deflationaryPressure || 0
		};
	}

	// ==========================================
	// UTILITY METHODS
	// ==========================================

	private static sanitizeDgtAmount(amount: any): DgtAmount {
		const parsed = parseFloat(amount?.toString() || '0');
		return (isNaN(parsed) ? 0 : Math.max(0, parsed)) as DgtAmount;
	}

	private static sanitizeUsdAmount(amount: any): UsdAmount {
		const parsed = parseFloat(amount?.toString() || '0');
		return (isNaN(parsed) ? 0 : Math.max(0, parsed)) as UsdAmount;
	}

	private static calculateDiscountPercentage(
		currentPrice: any,
		originalPrice: any
	): number | undefined {
		if (!originalPrice || !currentPrice) return undefined;
		const current = parseFloat(currentPrice.toString());
		const original = parseFloat(originalPrice.toString());
		if (original <= current) return undefined;
		return Math.round(((original - current) / original) * 100);
	}

	private static getRarityColor(rarity: ItemRarity): string {
		const colors = {
			common: '#9ca3af', // gray-400
			rare: '#3b82f6', // blue-500
			epic: '#8b5cf6', // violet-500
			legendary: '#f59e0b', // amber-500
			mythic: '#ef4444' // red-500
		};
		return colors[rarity] || colors.common;
	}

	private static getRarityGlow(rarity: ItemRarity): string | undefined {
		const glows = {
			epic: '0 0 20px rgba(139, 92, 246, 0.5)',
			legendary: '0 0 20px rgba(245, 158, 11, 0.5)',
			mythic: '0 0 20px rgba(239, 68, 68, 0.7)'
		};
		return glows[rarity as keyof typeof glows];
	}

	private static isItemAvailable(dbItem: any): boolean {
		const now = new Date();
		if (dbItem.releaseDate && dbItem.releaseDate > now) return false;
		if (dbItem.expiryDate && dbItem.expiryDate < now) return false;
		if (dbItem.isLimited && dbItem.stockRemaining <= 0) return false;
		return dbItem.isActive !== false;
	}

	private static calculatePopularityScore(dbItem: any): number {
		// Combine view count, purchase count, and equipment rate
		const views = dbItem.viewCount || 0;
		const purchases = dbItem.purchaseCount || 0;
		const equipped = dbItem.equippedCount || 0;

		// Weighted scoring
		const viewScore = Math.min(views / 1000, 0.3) * 100;
		const purchaseScore = Math.min(purchases / 100, 0.4) * 100;
		const equipScore = Math.min(equipped / 50, 0.3) * 100;

		return Math.round(viewScore + purchaseScore + equipScore);
	}

	private static checkUserOwnership(itemId: any, userInventory?: any[]): boolean {
		if (!userInventory) return false;
		return userInventory.some((item) => item.itemId === itemId);
	}

	private static getUserItemQuantity(itemId: any, userInventory?: any[]): number {
		if (!userInventory) return 0;
		const item = userInventory.find((inv) => inv.itemId === itemId);
		return item?.quantity || 0;
	}

	private static canUserPurchase(dbItem: any, user: any, alreadyOwned: boolean): boolean {
		// Basic availability check
		if (!this.isItemAvailable(dbItem)) return false;

		// User level requirements
		if (dbItem.requiredLevel && user.level < dbItem.requiredLevel) return false;

		// Purchase limits
		if (dbItem.maxQuantityPerUser && alreadyOwned) {
			// Check if user has reached purchase limit
			return false; // Simplified - would need actual quantity check
		}

		return true;
	}

	private static getSimilarItems(dbItem: any, user: any): ItemId[] {
		// This would be implemented with actual recommendation logic
		return [];
	}

	private static getBundleOpportunities(dbItem: any, userInventory?: any[]): ItemId[] {
		// This would be implemented with actual bundle logic
		return [];
	}

	private static canUserPreview(dbItem: any, user: any): boolean {
		return user?.level >= 1; // Basic level requirement for previews
	}

	private static getEnhancedPreviewUrl(dbItem: any, user: any): string | undefined {
		if (!this.canUserPreview(dbItem, user)) return undefined;
		return dbItem.enhancedPreviewUrl || dbItem.previewUrl;
	}

	private static generatePreviewUrl(dbItem: any): string | undefined {
		if (!dbItem.id) return undefined;
		return `/api/shop/preview/${dbItem.id}`;
	}

	private static generateThumbnailUrl(dbItem: any): string | undefined {
		if (!dbItem.id) return undefined;
		return `/api/shop/thumbnail/${dbItem.id}`;
	}

	private static calculateUsdValue(dgtAmount: any): UsdAmount {
		const dgt = parseFloat(dgtAmount?.toString() || '0');
		const rate = parseFloat(process.env.DGT_USD_RATE || '0.01');
		return (dgt * rate) as UsdAmount;
	}

	private static calculateAverageSalePrice(analytics: any): DgtAmount {
		if (!analytics?.totalSales || analytics.totalSales === 0) return 0 as DgtAmount;
		return this.sanitizeDgtAmount(analytics.totalRevenue / analytics.totalSales);
	}

	private static calculateConversionRate(analytics: any): number {
		if (!analytics?.viewCount || analytics.viewCount === 0) return 0;
		return Math.round((analytics.totalSales / analytics.viewCount) * 100 * 100) / 100;
	}

	private static determinePopularityTrend(analytics: any): 'rising' | 'stable' | 'falling' {
		// This would analyze historical data
		return 'stable';
	}

	private static shouldShowStockAlerts(dbItem: any): boolean {
		if (!dbItem.isLimited) return false;
		return dbItem.stockRemaining <= (dbItem.stockAlertThreshold || 10);
	}

	private static isReplenishmentNeeded(dbItem: any): boolean {
		if (!dbItem.isLimited) return false;
		return dbItem.stockRemaining <= (dbItem.replenishmentThreshold || 5);
	}

	private static getTopBuyers(analytics: any): any[] {
		return (analytics?.topBuyers || []).map((buyer: any) => ({
			userId: buyer.userId as UserId,
			username: buyer.username,
			totalSpent: this.sanitizeDgtAmount(buyer.totalSpent),
			purchaseCount: buyer.purchaseCount
		}));
	}

	private static canOrderBeRefunded(dbOrder: any): boolean {
		if (dbOrder.status !== 'completed') return false;
		const refundWindow = 24 * 60 * 60 * 1000; // 24 hours
		const completedAt = new Date(dbOrder.completedAt);
		return Date.now() - completedAt.getTime() < refundWindow;
	}

	private static getRefundDeadline(dbOrder: any): Date | undefined {
		if (!this.canOrderBeRefunded(dbOrder)) return undefined;
		const completedAt = new Date(dbOrder.completedAt);
		return new Date(completedAt.getTime() + 24 * 60 * 60 * 1000);
	}

	private static anonymizeEmail(email?: string): string | undefined {
		if (!email) return undefined;
		const [local, domain] = email.split('@');
		if (!local || !domain) return undefined;
		const masked = local.substring(0, 2) + '***';
		return `${masked}@${domain}`;
	}

	private static anonymizeIP(ip?: string): string | undefined {
		if (!ip) return undefined;
		if (ip.includes(':')) {
			// IPv6
			const parts = ip.split(':');
			return parts.slice(0, 4).join(':') + '::***';
		} else {
			// IPv4
			const parts = ip.split('.');
			return parts.slice(0, 3).join('.') + '.***';
		}
	}

	private static calculateOrderRiskScore(dbOrder: any): number {
		let score = 0;

		// Large order amounts
		if (dbOrder.totalAmount > 10000) score += 2;
		else if (dbOrder.totalAmount > 5000) score += 1;

		// Fast consecutive orders
		if (dbOrder.consecutiveOrdersInHour > 5) score += 3;
		else if (dbOrder.consecutiveOrdersInHour > 2) score += 1;

		// New user behavior
		if (dbOrder.userAccountAge < 7) score += 2; // Account less than 7 days

		// Suspicious patterns
		if (dbOrder.flaggedPatterns) score += 3;

		return Math.min(10, score);
	}

	private static transformBurnByCategory(burnData: any): any {
		const result: any = {};

		for (const [category, data] of Object.entries(burnData)) {
			result[category] = {
				amount: this.sanitizeDgtAmount((data as any).amount),
				transactions: (data as any).transactions,
				topItems: ((data as any).topItems || []).map((item: any) => ({
					itemId: item.itemId as ItemId,
					name: item.name,
					burned: this.sanitizeDgtAmount(item.burned)
				}))
			};
		}

		return result;
	}
}
