import type { ProductId, InventoryId, UserId } from '@shared/types';

export interface PluginReward {
	type: string;
	value?: string | number | boolean;
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	description?: string;
}

export interface Product {
	id: ProductId;
	name: string;
	description: string;
	price: number;
	pluginReward?: PluginReward;
	imageUrl?: string;
	category?: string;
}

export interface UserInventory {
	id: InventoryId; // Inventory item UUID
	userId: UserId;
	productId: ProductId;
	quantity: number;
	equipped: boolean;
	acquiredAt: string; // ISO date string
	updatedAt: string; // ISO date string
	metadata?: Record<string, unknown>;
	// Add any other userInventory fields
}

export interface UserInventoryWithProduct {
	id: InventoryId;
	userId: UserId;
	productId: ProductId;
	equipped: boolean;
	purchasedAt: string;
	product: Product;
}

// Define the structure of the aggregated cosmetic effects
export interface AppliedCosmetics {
	usernameColor?: string;
	userTitle?: string;
	avatarFrameUrl?: string;
	emojiMap: Record<string, string>;
	unlockedFeatures: string[];
}
