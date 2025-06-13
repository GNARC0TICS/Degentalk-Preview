import { useQuery } from '@tanstack/react-query';
import type { UserInventoryWithProduct } from '@/types/inventory';
import { apiRequest } from '@/lib/queryClient';

/**
 * Hook to fetch user inventory with product details
 * @param userId - User ID to fetch inventory for
 * @returns User inventory data with product details
 */
export function useUserInventory(userId?: number) {
	return useQuery<UserInventoryWithProduct[]>({
		queryKey: ['user-inventory', userId],
		queryFn: async () => {
			if (!userId) {
				throw new Error('User ID is required');
			}

			const response = await apiRequest({
				url: `/api/admin/user-inventory/${userId}`,
				method: 'GET'
			});

			return response.data || [];
		},
		enabled: !!userId,
		staleTime: 5 * 60 * 1000 // 5 minutes
	});
}
