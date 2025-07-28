import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import type { ItemCategory } from '@/hooks/use-vault-items';

// Define the ShopItem type
export interface ShopItem {
	id: string;
	name: string;
	description: string;
	category: string; // Changed from ItemCategory to string to match API
	price: number; // This is the DGT price from API
	priceDGT?: number; // Keep for backward compatibility
	priceUSDT?: number;
	rarity: 'common' | 'rare' | 'epic' | 'legendary'; // Added 'epic'
	imageUrl?: string;
	previewUrl?: string;
	thumbnailUrl?: string;
	rarityColor?: string;
	rarityGlow?: string;
	isAvailable?: boolean;
	isLimited?: boolean;
	popularityScore?: number;
	tags?: string[];
	isOwned?: boolean;
	isEquipped?: boolean;
	isLocked?: boolean;
	requiredXP?: number;
	expiresAt?: Date | null;

	// Availability properties
	availableFrom?: Date | null;
	availableUntil?: Date | null;
	stockLimit?: number | null;
	stockLeft?: number | null;

	// Featured and promotion properties
	isFeatured?: boolean;
	featuredUntil?: Date | null;
	promotionLabel?: string | null;
}

// Shop API response interface
interface ShopItemsResponse {
	items: ShopItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	filters: {
		category: string;
		sort: string;
	};
	user: {
		isAuthenticated: boolean;
		dgtBalance?: number;
	};
}

/**
 * @hook useShopItems
 * Fetches a list of shop items, optionally filtered by category.
 * Handles loading, error, and data states using TanStack Query.
 */
export function useShopItems(category?: string) {
	const {
		data,
		isLoading,
		isError,
		error,
		refetch
	} = useQuery({
		queryKey: ['shopItems', category],
		queryFn: async () => {
			return await apiRequest<ShopItemsResponse>({
				url: '/api/shop/items',
				method: 'GET',
				params: category ? { category } : undefined
			});
		},
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	return {
		items: data?.items || [],
		isLoading,
		isError,
		error,
		refetch
	};
}

/**
 * @hook useShopItem
 * Fetches details for a single shop item by its ID.
 * Handles loading, error, and data states using TanStack Query.
 */
export function useShopItem(itemId: string) {
	const {
		data: item,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: ['shopItem', itemId],
		queryFn: async () => {
			return await apiRequest<ShopItem>({
				url: `/api/shop/items/${itemId}`,
				method: 'GET'
			});
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!itemId
	});

	return {
		item,
		isLoading,
		isError,
		error
	};
}
