import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import type { ItemCategory } from '@/hooks/use-vault-items';

// Define the ShopItem type
export interface ShopItem {
	id: string;
	name: string;
	description: string;
	category: ItemCategory;
	priceDGT: number;
	priceUSDT: number;
	rarity: 'common' | 'rare' | 'legendary';
	imageUrl?: string;
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

/**
 * @hook useShopItems
 * Fetches a list of shop items, optionally filtered by category.
 * Handles loading, error, and data states using TanStack Query.
 */
export function useShopItems(category?: ItemCategory) {
	const {
		data: items = [],
		isLoading,
		isError,
		error,
		refetch
	} = useQuery({
		queryKey: ['shopItems', category],
		queryFn: async () => {
			return await apiRequest<ShopItem[]>({
				url: '/api/shop/items',
				params: category ? { category } : undefined
			});
		},
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	return {
		items,
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
				url: `/api/shop/items/${itemId}`
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
