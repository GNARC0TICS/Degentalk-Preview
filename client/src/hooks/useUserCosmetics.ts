import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UserInventoryWithProduct, AppliedCosmetics } from '@/types/inventory';
import { apiRequest } from '@/utils/api-request';
import { applyPluginRewards } from '@/utils/utils/applyPluginRewards';
import type { UserId } from '@shared/types/ids';

// TODO: Replace with actual useUser hook from your application
// This is a placeholder/mock for demonstration if the real hook doesn't exist yet.
interface UserContextType {
	user: {
		id: UserId;
		username: string;
		role?: string; // Added role field
	} | null;
	isLoading: boolean;
}
const useUser = (): UserContextType => {
	// In a real application, this would fetch the logged-in user's data
	// For now, let's mock a user if needed for local testing
	return {
		user: {
			id: crypto.randomUUID(),
			username: 'TestUser',
			role: undefined // Change to 'admin', 'moderator', or 'dev' to test role colors
		},
		isLoading: false
	};
};

/**
 * Custom hook to fetch and apply a user's equipped cosmetic rewards.
 * This hook fetches the user's inventory and processes equipped items
 * to return a consolidated object of applied cosmetic effects.
 * System roles (admin, mod, dev) will override cosmetic username colors.
 */
export function useUserCosmetics(targetUserId?: string | number): {
	cosmetics: AppliedCosmetics;
	isLoading: boolean;
	isError: boolean;
} {
	const { user, isLoading: isLoadingUser } = useUser();

	const effectiveUserId = targetUserId ?? user?.id;

	const {
		data: inventory,
		isLoading: isLoadingInventory,
		isError
	} = useQuery<UserInventoryWithProduct[], Error>({
		queryKey: ['userCosmeticsInventory', effectiveUserId],
		queryFn: async () => {
			if (!effectiveUserId) {
				return Promise.reject(new Error('User ID is required to fetch inventory.'));
			}
			try {
				const response = await apiRequest<UserInventoryWithProduct[]>({
					url: `/api/user/${effectiveUserId}/inventory`,
					method: 'GET'
				});
				return response || [];
			} catch (error: any) {
				// If rate limited, return empty array to avoid breaking the UI
				if (error?.status === 429) {
					console.warn('Rate limited on inventory fetch, using empty inventory');
					return [];
				}
				throw error;
			}
		},
		enabled: !!effectiveUserId, // Only fetch if user ID is available
		staleTime: 30 * 60 * 1000, // Data considered fresh for 30 minutes (increased from 5)
		gcTime: 60 * 60 * 1000, // Data remains in cache for 1 hour (increased from 10 minutes)
		retry: (failureCount, error: any) => {
			// Don't retry on rate limit errors
			if (error?.status === 429) {
				return false;
			}
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});

	const [appliedCosmetics, setAppliedCosmetics] = useState<AppliedCosmetics>({
		emojiMap: {},
		unlockedFeatures: []
	});

	useEffect(() => {
		if (inventory) {
			// Pass user role to applyPluginRewards for system color overrides
			setAppliedCosmetics(applyPluginRewards(inventory, user?.role));
		} else {
			// Reset cosmetics if inventory is null or undefined (e.g., user logs out)
			setAppliedCosmetics({
				emojiMap: {},
				unlockedFeatures: []
			});
		}
	}, [inventory, user?.role]);

	return {
		cosmetics: appliedCosmetics,
		isLoading: isLoadingUser || isLoadingInventory,
		isError
	};
}
