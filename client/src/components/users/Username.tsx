import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUserCosmetics } from '@/hooks/useUserCosmetics';
import { SYSTEM_ROLE_COLORS } from '@/lib/utils/applyPluginRewards';
import { useProfileCard } from '@/contexts/ProfileCardContext';

interface UsernameProps {
	username: string;
	className?: string;
	showTitle?: boolean;
	titleClassName?: string;
	isVerified?: boolean;
	groupName?: string;
	groupColor?: string;
	userId?: string;
	userRole?: string; // Added to check for system roles
	showRarityBadge?: boolean; // Added to optionally show rarity
}

// Map special color values to CSS classes
const SPECIAL_COLOR_CLASSES: Record<string, string> = {
	'rainbow-shimmer':
		'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 bg-clip-text text-transparent animate-gradient',
	'void-pulse': 'text-black animate-pulse shadow-red-500/50 text-shadow-glow'
};

// Rarity emoji indicators
const RARITY_INDICATORS: Record<string, string> = {
	cope: '🟫',
	normie: '🟨',
	bagholder: '🟪',
	max_bidder: '🔵',
	high_roller: '🟧',
	exit_liquidity: '🟥'
};

/**
 * Username component that applies cosmetic effects like custom colors and titles
 * System roles (admin, mod, dev) override cosmetic colors
 */
export function Username({
	username,
	className,
	showTitle = true,
	titleClassName,
	isVerified = false,
	groupName,
	groupColor,
	userId,
	userRole,
	showRarityBadge = false
}: UsernameProps) {
	// Use the new hook to get cosmetics for the user
	const { cosmetics, isLoading: isLoadingCosmetics } = useUserCosmetics();
	// Profile card context for quick swap on click
	const { setCurrentUsername } = useProfileCard();

	// Handle loading state for cosmetics
	if (isLoadingCosmetics) {
		return (
			<div className={cn('inline-flex items-center gap-1.5', className)}>
				<span className={cn('font-medium', 'text-white')}>{username}</span>
			</div>
		);
	}

	// Determine username color priority:
	// 1. System role color (admin/mod/dev)
	// 2. Cosmetic color
	// 3. Group color
	// 4. Default white
	let displayUsernameColor = groupColor;
	let isSpecialColor = false;
	let colorRarity: string | undefined;

	// Check for system role color first
	if (userRole && SYSTEM_ROLE_COLORS[userRole]) {
		displayUsernameColor = SYSTEM_ROLE_COLORS[userRole];
	} else if (cosmetics.usernameColor) {
		// Check if it's a special color that needs a class
		if (SPECIAL_COLOR_CLASSES[cosmetics.usernameColor]) {
			isSpecialColor = true;
			displayUsernameColor = undefined; // Don't use inline style for special colors
		} else {
			displayUsernameColor = cosmetics.usernameColor;
		}

		// Extract rarity if available (would need to be added to cosmetics data)
		// For now, we'll determine it based on the color value
		if (cosmetics.usernameColor === 'rainbow-shimmer' || cosmetics.usernameColor === 'void-pulse') {
			colorRarity = 'exit_liquidity';
		}
	}

	return (
		<div
			className={cn('inline-flex items-center gap-1.5 cursor-pointer', className)}
			onClick={() => setCurrentUsername(username)}
		>
			{/* Rarity indicator (optional) */}
			{showRarityBadge && colorRarity && RARITY_INDICATORS[colorRarity] && (
				<span className="text-xs">{RARITY_INDICATORS[colorRarity]}</span>
			)}

			{/* Username with color */}
			<span
				className={cn(
					'font-medium',
					!displayUsernameColor && !isSpecialColor && 'text-white',
					isSpecialColor &&
						cosmetics.usernameColor &&
						SPECIAL_COLOR_CLASSES[cosmetics.usernameColor]
				)}
				style={
					displayUsernameColor && !isSpecialColor ? { color: displayUsernameColor } : undefined
				}
			>
				{username}
			</span>

			{/* System role badge (for admin/mod/dev) */}
			{userRole && SYSTEM_ROLE_COLORS[userRole] && (
				<Badge
					variant="secondary"
					className={cn('text-xs px-1.5 py-0', 'border', titleClassName)}
					style={{ borderColor: SYSTEM_ROLE_COLORS[userRole], color: SYSTEM_ROLE_COLORS[userRole] }}
				>
					{userRole.toUpperCase()}
				</Badge>
			)}

			{/* Verified badge */}
			{isVerified && (
				<svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clipRule="evenodd"
					/>
				</svg>
			)}

			{/* User title from cosmetics (prioritized) */}
			{showTitle && cosmetics.userTitle && !userRole && (
				<Badge
					variant="secondary"
					className={cn(
						'text-xs px-1.5 py-0',
						'bg-gradient-to-r from-purple-600/20 to-blue-600/20',
						'border border-purple-500/30',
						titleClassName
					)}
				>
					{cosmetics.userTitle}
				</Badge>
			)}

			{/* Group badge (fallback if no custom title and no system role) */}
			{showTitle && !cosmetics.userTitle && !userRole && groupName && (
				<Badge
					variant="secondary"
					className={cn('text-xs px-1.5 py-0', titleClassName)}
					style={groupColor ? { borderColor: groupColor, color: groupColor } : undefined}
				>
					{groupName}
				</Badge>
			)}
		</div>
	);
}

// Export a simple username span for minimal use cases
export function SimpleUsername({
	username,
	color,
	className
}: {
	username: string;
	color?: string;
	className?: string;
}) {
	return (
		<span
			className={cn('font-medium', !color && 'text-white', className)}
			style={color ? { color } : undefined}
		>
			{username}
		</span>
	);
}

export { Username as UserName };
