export interface PluginReward {
	type: string;
	value?: any;
	rarity?: string;
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
	id: number;
	userId: number;
	productId: number;
	quantity: number;
	equipped: boolean;
	acquiredAt: string; // ISO date string
	updatedAt: string; // ISO date string
	metadata?: any;
	// Add any other userInventory fields
}

export interface UserInventoryWithProduct {
	id: number;
	userId: number;
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
