import { useUserCosmetics } from '@/hooks/useUserCosmetics';
import { useUserXP } from '@/hooks/useUserXP';
import type { UserId, RoleId } from '@/types/ids';

interface BaseUser {
	id: string;
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
export function useIdentityDisplay(user: BaseUser | null | undefined): IdentityDisplay | null {
	const { cosmetics } = useUserCosmetics(user?.id);
	const { data: xpData } = useUserXP(user?.id as UserId);

	if (!user) return null;

	const primaryRole = user.roles?.[0];

	return {
		displayName: user.username,
		usernameColor: primaryRole?.hexColor || cosmetics?.usernameColor || undefined,
		primaryRole: primaryRole ? { name: primaryRole.name, color: primaryRole.hexColor } : undefined,
		title: cosmetics?.userTitle ?? null,
		level: xpData?.currentLevel ?? user.level ?? undefined,
		avatarFrame: cosmetics?.avatarFrame ?? null
	};
}
