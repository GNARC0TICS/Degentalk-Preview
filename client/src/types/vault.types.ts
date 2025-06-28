/**
 * Vault System Type Definitions
 * Admin vault service, rare items, and vault management
 */

// Base vault item types (imported from existing vault)
export type ItemCategory = 'frame' | 'title' | 'color' | 'boost' | 'special';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type UnlockMethod = 'purchase' | 'achievement' | 'event' | 'admin_grant' | 'level_unlock';
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter' | 'holiday' | 'special';

// Vault item interfaces
export interface BaseVaultItem {
	id: string;
	name: string;
	category: ItemCategory;
	rarity: ItemRarity;
	description?: string;
	isActive: boolean;
	unlockMethods: UnlockMethod[];
	prices?: {
		dgt?: number;
		usdt?: number;
	};
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export interface VaultFrame extends BaseVaultItem {
	category: 'frame';
	frameUrl: string;
	previewUrl?: string;
	dimensions?: {
		width: number;
		height: number;
	};
}

export interface VaultTitle extends BaseVaultItem {
	category: 'title';
	titleText: string;
	color?: string;
	effects?: {
		glow?: boolean;
		animated?: boolean;
		gradient?: string[];
	};
}

export interface VaultColor extends BaseVaultItem {
	category: 'color';
	colorValue: string;
	colorName: string;
	previewText?: string;
}

export interface VaultBoost extends BaseVaultItem {
	category: 'boost';
	boostType: 'xp' | 'dgt' | 'forum' | 'social';
	multiplier: number;
	duration?: number; // in hours
	maxUses?: number;
}

// Event management types
export interface VaultEvent {
	id: string;
	name: string;
	description?: string;
	startDate: string;
	endDate: string;
	itemIds: string[];
	isActive: boolean;
	seasonType?: SeasonType;
	requirements?: EventRequirement[];
	rewards?: EventReward[];
	metadata?: Record<string, unknown>;
}

export interface EventRequirement {
	type: 'level' | 'achievement' | 'posts' | 'days_active' | 'custom';
	value: number | string;
	operator?: 'gte' | 'lte' | 'eq';
}

export interface EventReward {
	type: 'item' | 'xp' | 'dgt' | 'temporary_access';
	value: string | number;
	quantity?: number;
	duration?: number;
}

// Admin action logging
export interface AdminActionLog {
	id: string;
	timestamp: string;
	adminId: string;
	action: VaultAdminAction;
	targetType: 'item' | 'event' | 'user' | 'system';
	targetId: string;
	details: VaultActionDetails;
	ipAddress?: string;
	userAgent?: string;
}

export type VaultAdminAction =
	| 'create_item'
	| 'update_item'
	| 'delete_item'
	| 'enable_item'
	| 'disable_item'
	| 'grant_item'
	| 'revoke_item'
	| 'create_event'
	| 'update_event'
	| 'end_event'
	| 'bulk_operation';

export interface VaultActionDetails {
	previousState?: Record<string, unknown>;
	newState?: Record<string, unknown>;
	affectedUsers?: string[];
	reason?: string;
	bulkCount?: number;
	metadata?: Record<string, unknown>;
}

// User vault inventory
export interface UserVaultItem {
	id: string;
	userId: string;
	itemId: string;
	acquiredAt: string;
	acquiredMethod: UnlockMethod;
	isEquipped: boolean;
	usesRemaining?: number;
	expiresAt?: string;
	metadata?: Record<string, unknown>;
	item?: BaseVaultItem;
}

// History tracking
export interface ItemHistory {
	id: string;
	itemId: string;
	action: 'created' | 'updated' | 'enabled' | 'disabled' | 'granted' | 'purchased';
	timestamp: string;
	adminId?: string;
	userId?: string;
	changes?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}

// Admin service interface
export interface VaultAdminService {
	// Item CRUD operations
	getItem(id: string): Promise<BaseVaultItem | null>;
	getAllItems(): Promise<BaseVaultItem[]>;
	getItemsByCategory(category: ItemCategory): Promise<BaseVaultItem[]>;
	getItemsByRarity(rarity: ItemRarity): Promise<BaseVaultItem[]>;
	createItem(item: Omit<BaseVaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<BaseVaultItem>;
	updateItem(id: string, updates: Partial<BaseVaultItem>): Promise<BaseVaultItem>;
	deleteItem(id: string): Promise<boolean>;

	// Item state management
	enableItem(id: string): Promise<BaseVaultItem>;
	disableItem(id: string): Promise<BaseVaultItem>;
	setItemRarity(id: string, rarity: ItemRarity): Promise<BaseVaultItem>;
	setItemPrice(id: string, prices: { dgt?: number; usdt?: number }): Promise<BaseVaultItem>;
	addItemUnlockMethod(id: string, method: UnlockMethod): Promise<BaseVaultItem>;

	// Event management
	createEvent(event: Omit<VaultEvent, 'id'>): Promise<VaultEvent>;
	updateEvent(id: string, updates: Partial<VaultEvent>): Promise<VaultEvent>;
	endEvent(id: string): Promise<VaultEvent>;
	getActiveEvents(): Promise<VaultEvent[]>;

	// User operations
	grantItemToUser(userId: string, itemId: string, method: UnlockMethod): Promise<UserVaultItem>;
	revokeItemFromUser(userId: string, itemId: string): Promise<boolean>;
	getUserItems(userId: string): Promise<UserVaultItem[]>;

	// Analytics and reporting
	getItemStatistics(itemId: string): Promise<ItemStatistics>;
	getAdminActionLogs(filters?: AdminLogFilters): Promise<AdminActionLog[]>;
	getItemHistory(itemId: string): Promise<ItemHistory[]>;
}

// Analytics types
export interface ItemStatistics {
	itemId: string;
	totalOwners: number;
	totalGranted: number;
	totalPurchased: number;
	popularityRank: number;
	revenueGenerated: number;
	acquisitionMethods: Record<UnlockMethod, number>;
	dailyStats: {
		date: string;
		grants: number;
		purchases: number;
		revenue: number;
	}[];
}

export interface AdminLogFilters {
	adminId?: string;
	action?: VaultAdminAction;
	targetType?: string;
	startDate?: string;
	endDate?: string;
	limit?: number;
	offset?: number;
}

// Bulk operations
export interface BulkVaultOperation {
	operation: 'enable' | 'disable' | 'update_price' | 'update_rarity' | 'grant_to_users';
	itemIds: string[];
	userIds?: string[];
	data?: Record<string, unknown>;
	reason?: string;
}

export interface BulkOperationResult {
	success: number;
	failed: number;
	results: Array<{
		itemId: string;
		success: boolean;
		error?: string;
	}>;
}
