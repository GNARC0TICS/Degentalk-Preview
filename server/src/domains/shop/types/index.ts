/**
 * Shop Domain Types
 * 
 * Security-aware DTOs for shop and cosmetics with role-based data exposure
 * Follows the established transformer pattern from Users, Forums, and Economy domains
 */

import type { 
  UserId, 
  DgtAmount, 
  UsdAmount,
  ItemId,
  OrderId,
  ItemRarity,
  ItemCategory,
  InventoryItemId
} from '@shared/types';

// ==========================================
// SHOP PRODUCT TYPES
// ==========================================

/**
 * Public shop item - visible to all users (logged in or not)
 * Shows basic product information for catalog browsing
 */
export interface PublicShopItem {
  id: ItemId;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  
  // Pricing (always in DGT)
  price: DgtAmount;
  originalPrice?: DgtAmount; // For discount display
  discountPercentage?: number;
  
  // Visual metadata
  previewUrl?: string;
  thumbnailUrl?: string;
  rarityColor: string;
  rarityGlow?: string;
  
  // Availability
  isAvailable: boolean;
  isLimited: boolean;
  stockRemaining?: number; // Only if limited
  releaseDate?: string;
  expiryDate?: string;
  
  // Basic stats for sorting/filtering
  popularityScore: number; // 0-100
  tags: string[];
}

/**
 * Authenticated shop item - for logged-in users
 * Adds purchase permissions and user-specific context
 */
export interface AuthenticatedShopItem extends PublicShopItem {
  // User-specific data
  canPurchase: boolean;
  canAfford: boolean;
  alreadyOwned: boolean;
  
  // Purchase context
  userDgtBalance: DgtAmount;
  requiredDgt: DgtAmount;
  dgtShortfall?: DgtAmount;
  
  // Ownership tracking
  ownedQuantity: number;
  maxQuantity?: number; // Purchase limit per user
  
  // Recommendations
  similarItems: ItemId[];
  bundleOpportunities: ItemId[];
  
  // Preview permissions
  canPreview: boolean;
  previewUrl?: string; // Enhanced preview for authenticated users
}

/**
 * Admin shop item - for administrative management
 * Includes all metrics, analytics, and management data
 */
export interface AdminShopItem extends AuthenticatedShopItem {
  // Financial metrics
  totalRevenue: DgtAmount;
  totalSales: number;
  revenueUsd: UsdAmount;
  averageSalePrice: DgtAmount;
  
  // Analytics
  viewCount: number;
  conversionRate: number; // views → purchases
  popularityTrend: 'rising' | 'stable' | 'falling';
  lastPurchaseAt?: string;
  
  // Inventory management
  totalStock?: number;
  stockAlerts: boolean;
  replenishmentNeeded: boolean;
  
  // Content management
  createdAt: string;
  updatedAt: string;
  createdBy: UserId;
  lastModifiedBy?: UserId;
  
  // Status tracking
  isActive: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  
  // Performance insights
  topBuyers: Array<{
    userId: UserId;
    username: string;
    totalSpent: DgtAmount;
    purchaseCount: number;
  }>;
  
  // A/B testing data
  experimentId?: string;
  conversionVariant?: string;
}

// ==========================================
// COSMETICS TYPES
// ==========================================

/**
 * Public cosmetic - basic cosmetic information for browsing
 */
export interface PublicCosmetic {
  id: ItemId;
  name: string;
  description: string;
  type: 'avatar_frame' | 'username_color' | 'title' | 'badge' | 'signature_effect' | 'emoji_pack' | 'theme';
  rarity: ItemRarity;
  
  // Visual data
  previewUrl: string;
  thumbnailUrl?: string;
  colorHex?: string;
  effectType?: 'glow' | 'particle' | 'animation' | 'gradient';
  
  // Metadata
  tags: string[];
  isAnimated: boolean;
  isLimited: boolean;
  
  // Social proof
  popularityScore: number;
  equippedByCount: number; // How many users have this equipped
}

/**
 * Owned cosmetic - for authenticated users showing ownership and equip status
 */
export interface OwnedCosmetic extends PublicCosmetic {
  // Ownership status
  isOwned: boolean;
  isEquipped: boolean;
  acquiredAt?: string;
  
  // Equipment permissions
  canEquip: boolean;
  canUnequip: boolean;
  conflictsWith: ItemId[]; // Other items that can't be equipped simultaneously
  
  // If not owned - purchase info
  shopItemId?: ItemId;
  price?: DgtAmount;
  canAfford?: boolean;
  
  // Customization options (if applicable)
  customizations?: {
    colorOptions?: string[];
    sizeOptions?: ('small' | 'medium' | 'large')[];
    animationSpeed?: number;
  };
}

/**
 * Admin cosmetic - comprehensive management view
 */
export interface AdminCosmetic extends OwnedCosmetic {
  // Usage analytics
  totalOwners: number;
  totalEquipped: number;
  equipmentRate: number; // owned → equipped conversion
  
  // Revenue data
  totalRevenue: DgtAmount;
  totalSales: number;
  averageSalePrice: DgtAmount;
  
  // Content management
  createdAt: string;
  updatedAt: string;
  createdBy: UserId;
  
  // File management
  assetUrl: string;
  assetSize: number; // bytes
  assetType: string; // MIME type
  
  // Status
  isActive: boolean;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  
  // Performance metrics
  engagementScore: number; // Based on equip rate, retention, etc.
  retentionRate: number; // Users who keep it equipped
  
  // System data
  version: number;
  compatibilityFlags: string[];
}

// ==========================================
// INVENTORY TYPES
// ==========================================

/**
 * User inventory item - authenticated view of owned items
 */
export interface UserInventoryItem {
  id: InventoryItemId;
  itemId: ItemId;
  userId: UserId;
  
  // Item details
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  type: string;
  
  // Ownership data
  quantity: number;
  acquiredAt: string;
  purchasePrice?: DgtAmount;
  source: 'purchase' | 'airdrop' | 'reward' | 'admin_grant';
  
  // Equipment status
  isEquipped: boolean;
  equippedAt?: string;
  equipSlot?: string;
  
  // Item state
  condition?: 'new' | 'good' | 'worn';
  usageCount?: number;
  
  // Metadata
  metadata?: Record<string, any>;
  customizations?: Record<string, any>;
}

/**
 * Admin inventory view - includes analytics and management data
 */
export interface AdminInventoryItem extends UserInventoryItem {
  // User context
  user: {
    id: UserId;
    username: string;
    level: number;
    totalSpent: DgtAmount;
  };
  
  // Analytics
  lastUsed?: string;
  usageFrequency: number;
  
  // Value tracking
  currentMarketValue?: DgtAmount;
  valueAppreciation?: number; // %
  
  // System tracking
  grantedBy?: UserId; // If admin granted
  grantReason?: string;
  
  // Status
  isFlagged: boolean;
  flagReason?: string;
}

// ==========================================
// ORDER TYPES
// ==========================================

/**
 * User order - purchase history for authenticated users
 */
export interface UserOrder {
  id: OrderId;
  userId: UserId;
  
  // Order details
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  totalAmount: DgtAmount;
  totalUsd?: UsdAmount;
  paymentMethod: 'dgt' | 'usdt' | 'combo';
  
  // Items
  items: Array<{
    itemId: ItemId;
    name: string;
    quantity: number;
    unitPrice: DgtAmount;
    totalPrice: DgtAmount;
  }>;
  
  // Timestamps
  createdAt: string;
  completedAt?: string;
  
  // Transaction tracking
  transactionId?: string;
  
  // Status
  canRefund: boolean;
  refundDeadline?: string;
}

/**
 * Admin order - comprehensive order management view
 */
export interface AdminOrder extends UserOrder {
  // User context
  user: {
    id: UserId;
    username: string;
    email?: string;
    totalLifetimeValue: DgtAmount;
    orderCount: number;
  };
  
  // Financial data
  revenueImpact: DgtAmount;
  marginAnalysis?: {
    cost: DgtAmount;
    margin: DgtAmount;
    marginPercent: number;
  };
  
  // System data
  ipAddress?: string; // Anonymized
  userAgent?: string;
  processingTime?: number; // milliseconds
  
  // Analytics
  conversionSource?: string;
  campaignId?: string;
  referrer?: string;
  
  // Risk management
  riskScore: number; // 0-10
  flaggedForReview: boolean;
  fraudScore?: number;
  
  // Administration
  notes?: string;
  lastReviewedBy?: UserId;
  lastReviewedAt?: string;
}

// ==========================================
// VANITY SINK ANALYTICS
// ==========================================

/**
 * DGT burn tracking for vanity economy analysis
 */
export interface VanitySinkMetrics {
  // Time period
  periodStart: string;
  periodEnd: string;
  
  // Burn statistics
  totalDgtBurned: DgtAmount;
  totalTransactions: number;
  averageBurnPerTransaction: DgtAmount;
  
  // Category breakdown
  burnByCategory: Record<ItemCategory, {
    amount: DgtAmount;
    transactions: number;
    topItems: Array<{ itemId: ItemId; name: string; burned: DgtAmount; }>;
  }>;
  
  // User behavior
  topSpenders: Array<{
    userId: UserId;
    username: string;
    totalBurned: DgtAmount;
    transactionCount: number;
    favoriteCategory: ItemCategory;
  }>;
  
  // Trends
  burnTrend: 'increasing' | 'stable' | 'decreasing';
  projectedMonthlyBurn: DgtAmount;
  burnVelocity: number; // DGT/day
  
  // Economic impact
  burnUsdValue: UsdAmount;
  economicMultiplier: number; // DGT circulation effect
  deflationaryPressure: number; // % of circulating supply
}

/**
 * Individual vanity sink event for tracking
 */
export interface VanitySinkEvent {
  id: string;
  userId: UserId;
  itemId: ItemId;
  orderId: OrderId;
  
  // Burn details
  dgtBurned: DgtAmount;
  burnType: 'purchase' | 'upgrade' | 'customization' | 'unlocks';
  
  // Context
  timestamp: string;
  source: 'shop' | 'game' | 'admin' | 'reward';
  metadata?: Record<string, any>;
  
  // Analytics context
  userLevel: number;
  userLifetimeSpent: DgtAmount;
  sessionContext?: string;
}