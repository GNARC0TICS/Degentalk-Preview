import React from 'react';
import { apiRequest } from '@/utils/api-request';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { logger } from '@/lib/logger';
import { 
  ShopOwnershipResponse, 
  ShopOwnershipResponseSchema,
  UserInventoryResponse,
  UserInventoryResponseSchema,
  validateApiResponse 
} from '@/schemas';

/**
 * Hook to check if the current user owns a specific shop item
 */
export function useShopItemOwnership(itemId: string | null) {
	const { user } = useAuth();
	const isAuthenticated = !!user;

	const { data, isLoading, error, refetch } = useQuery<ShopOwnershipResponse>({
		queryKey: ['/api/shop/check-ownership', itemId],
		queryFn: async () => {
			if (!itemId) return { owned: false };

			try {
				// Now the endpoint works for both authenticated and unauthenticated users
				const response = await apiRequest<ShopOwnershipResponse>({
					url: `/api/shop/check-ownership/${itemId}`,
					method: 'GET'
				});
				return response;
			} catch (err) {
				logger.error('useShopOwnership', 'Error checking item ownership:', err);
				return { owned: false };
			}
		},
		enabled: !!itemId // We no longer need to disable for unauthenticated users
	});

	return {
		isOwned: data?.owned || false,
		isLoading,
		isAuthenticated,
		error,
		refetchOwnership: refetch
	};
}

/**
 * Hook to get user's inventory items
 */
export function useUserInventory() {
	const { user } = useAuth();
	const isAuthenticated = !!user;

	const { data, isLoading, error, refetch } = useQuery<UserInventoryResponse>({
		queryKey: ['/api/shop/my-inventory'],
		queryFn: async () => {
			if (!isAuthenticated) return { items: [], groupedItems: {} };

			try {
				const response = await apiRequest<UserInventoryResponse>({
					url: '/api/shop/my-inventory',
					method: 'GET'
				});
				return response;
			} catch (err) {
				logger.error('useShopOwnership', 'Error fetching user inventory:', err);
				return { items: [], groupedItems: {} };
			}
		},
		enabled: isAuthenticated
	});

	return {
		inventoryItems: data?.items || [],
		groupedItems: data?.groupedItems || {},
		isLoading,
		isAuthenticated,
		error,
		refetchInventory: refetch
	};
}
