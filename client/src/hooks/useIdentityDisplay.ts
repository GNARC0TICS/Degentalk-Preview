import { useUserCosmetics } from '@app/hooks/useUserCosmetics';
import { useUserXP } from '@app/hooks/useUserXP';
import type { UserId, RoleId } from '@shared/types/ids';
import { parseId, toId } from '@shared/types/index';

interface BaseUser {
	id: UserId;
	username: string;
	roles?: Array<{ id: RoleId; name: string; hexColor?: string | null }>;
	level?: number;
}

export interface IdentityDisplay {
	displayName: string;
	usernameColor?: string;
	primaryRole?: {
		name: string;
		color?: string | null;
	};
	title?: string | null;
	level?: number;
	levelConfig?: {
		level: number;
		name: string;
		color: string;
		requiredXP: number;
		nextLevelXP?: number;
	};
	avatarFrame?: {
		imageUrl: string;
		rarityColor?: string;
	} | null;
}

/**
 * useIdentityDisplay
 *
 * Centralized hook that gathers cosmetic & role data for a user and returns
 * a small object ready for UI components. Falls back gracefully when data missing.
 */
export function useIdentityDisplay(
	user: BaseUser | Partial<BaseUser> | null | undefined
): IdentityDisplay | null {
	const { cosmetics } = useUserCosmetics(user?.id);
	const { data: xpData } = useUserXP(user?.id);

	if (!user || !user.username) return null;

	const primaryRole = user.roles?.[0];

	const currentLevel = xpData?.currentLevel ?? user.level ?? 1;

	return {
		displayName: user.username,
		usernameColor: primaryRole?.hexColor || cosmetics?.usernameColor || undefined,
		primaryRole: primaryRole ? { name: primaryRole.name, color: primaryRole.hexColor } : undefined,
		title: cosmetics?.userTitle ?? null,
		level: currentLevel,
		levelConfig: {
			level: currentLevel,
			name: `Level ${currentLevel}`,
			color: primaryRole?.hexColor || '#10b981',
			requiredXP: currentLevel * 100,
			nextLevelXP: (currentLevel + 1) * 100
		},
		avatarFrame: cosmetics?.avatarFrame ?? null
	};
}
