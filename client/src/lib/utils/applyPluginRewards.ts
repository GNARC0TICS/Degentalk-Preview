import { UserInventoryWithProduct } from '@/types/inventory'; // Assuming this type exists or will be created

// System role colors - these override any cosmetic colors
const SYSTEM_ROLE_COLORS: Record<string, string> = {
	admin: '#D72638', // Red - Admin power
	mod: '#1E88E5', // Blue - Moderator trust
	dev: '#8E24AA' // Purple - Developer magic
};

interface AppliedCosmetics {
	usernameColor: string | null;
	userTitle: string | null;
	avatarFrameUrl: string | null;
	badge: string | null;
	unlockedFeatures: string[];
	emojiMap: Record<string, string>;
}

/**
 * Applies plugin rewards from a user's equipped inventory items.
 * System roles (admin, mod, dev) override cosmetic username colors.
 *
 * @param inventory - An array of user inventory items, including product details with pluginReward.
 * @param userRole - Optional user role for system color overrides
 * @returns An object containing aggregated cosmetic effects.
 */
export function applyPluginRewards(
	inventory: UserInventoryWithProduct[],
	userRole?: string
): AppliedCosmetics {
	const effects: AppliedCosmetics = {
		usernameColor: null,
		userTitle: null,
		avatarFrameUrl: null,
		badge: null,
		emojiMap: {} as Record<string, string>,
		unlockedFeatures: [] as string[]
	};

	// Check for system role color override first
	if (userRole && SYSTEM_ROLE_COLORS[userRole]) {
		effects.usernameColor = SYSTEM_ROLE_COLORS[userRole];
	}

	if (!inventory) {
		return effects;
	}

	const equippedItems = inventory.filter(
		(item) => item.equipped && item.product && item.product.pluginReward
	);

	for (const item of equippedItems) {
		let pluginRewardData = item.product.pluginReward;
		if (typeof pluginRewardData === 'string') {
			try {
				pluginRewardData = JSON.parse(pluginRewardData);
			} catch (error) {
				console.error('Failed to parse pluginReward JSON string:', pluginRewardData, error);
				continue;
			}
		}

		if (typeof pluginRewardData !== 'object' || pluginRewardData === null) {
			continue;
		}

		const { type, value } = pluginRewardData as any;

		switch (type) {
			case 'username_color':
				if (!effects.usernameColor) {
					effects.usernameColor = value;
				}
				break;
			case 'avatar_frame':
				effects.avatarFrameUrl = value?.startsWith('http')
					? value
					: `/api/images/frames/${value || 'default'}.png`;
				break;
			case 'user_title':
				if (typeof value === 'string') {
					effects.userTitle = value;
				}
				break;
			case 'badge':
				effects.badge = value;
				break;
			case 'emojiPack':
				if (typeof value === 'object' && value !== null) {
					effects.emojiMap = { ...effects.emojiMap, ...value };
				}
				break;
			case 'feature_unlock':
			case 'featureUnlock':
				if (typeof value === 'string' && !effects.unlockedFeatures.includes(value)) {
					effects.unlockedFeatures.push(value);
				}
				break;
			default:
				break;
		}
	}

	return effects;
}

// Export system role colors for use in other components
export { SYSTEM_ROLE_COLORS };

// Helper to check if a user has a system role
export function hasSystemRole(role?: string): boolean {
	return !!role && !!SYSTEM_ROLE_COLORS[role];
}

// Helper to get system role color
export function getSystemRoleColor(role?: string): string | undefined {
	return role ? SYSTEM_ROLE_COLORS[role] : undefined;
}

// Commenting out the duplicated type definitions as they should live in types/inventory.ts
/*
interface BasePluginReward {
  type: string;
  name?: string;
  description?: string;
}

interface UsernameColorPluginReward extends BasePluginReward {
  type: 'usernameColor';
  value: string; // Hex color
}

interface UserTitlePluginReward extends BasePluginReward {
  type: 'userTitle';
  value: string; // Title text
}

interface AvatarFramePluginReward extends BasePluginReward {
  type: 'avatarFrame';
  value: string; // URL to frame image
}

interface EmojiPackPluginReward extends BasePluginReward {
  type: 'emojiPack';
  value: Record<string, string>; // Map of emoji name to image URL
}

interface FeatureUnlockPluginReward extends BasePluginReward {
  type: 'featureUnlock';
  value: string; // Identifier for the unlocked feature
}

export type PluginReward = 
  | UsernameColorPluginReward 
  | UserTitlePluginReward 
  | AvatarFramePluginReward 
  | EmojiPackPluginReward 
  | FeatureUnlockPluginReward;
*/

// The duplicated applyPluginRewards function that was here has been removed.
