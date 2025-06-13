import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UserInventoryWithProduct, AppliedCosmetics } from '@/types/inventory';
import { apiRequest } from '@/lib/queryClient';
import { applyPluginRewards } from '@/lib/utils/applyPluginRewards';

// TODO: Replace with actual useUser hook from your application
// This is a placeholder/mock for demonstration if the real hook doesn't exist yet.
interface UserContextType {
	user: {
		id: number;
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
			id: 1,
			username: 'TestUser',
			role: undefined // Change to 'admin', 'mod', or 'dev' to test role colors
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
export function useUserCosmetics(): {
	cosmetics: AppliedCosmetics;
	isLoading: boolean;
	isError: boolean;
} {
	const { user, isLoading: isLoadingUser } = useUser();

	const {
		data: inventory,
		isLoading: isLoadingInventory,
		isError
	} = useQuery<UserInventoryWithProduct[], Error>({
		queryKey: ['userCosmeticsInventory', user?.id],
		queryFn: () => {
			if (!user?.id) {
				return Promise.reject(new Error('User ID is required to fetch inventory.'));
			}
			// Assuming an API endpoint to fetch a user's inventory with product details
			// This endpoint should join userInventory with products to get pluginReward
			return apiRequest<UserInventoryWithProduct[]>({ url: `/api/user/${user.id}/inventory` });
		},
		enabled: !!user?.id, // Only fetch if user ID is available
		staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
		cacheTime: 10 * 60 * 1000 // Data remains in cache for 10 minutes
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
