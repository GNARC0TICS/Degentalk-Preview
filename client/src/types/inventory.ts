export interface PluginReward {
	type: string;
	value?: string | number | boolean;
	rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	description?: string;
}

export interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	pluginReward?: PluginReward;
	imageUrl?: string;
	category?: string;
}

export interface UserInventory {
	id: number; // This is the inventory item's own ID, should be number
	userId: string; // User ID should be string
	productId: number;
	quantity: number;
	equipped: boolean;
	acquiredAt: string; // ISO date string
	updatedAt: string; // ISO date string
	metadata?: Record<string, unknown>;
	// Add any other userInventory fields
}

export interface UserInventoryWithProduct {
	id: number; // This is the inventory item's own ID, should be number
	userId: string; // User ID should be string
	productId: number;
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
