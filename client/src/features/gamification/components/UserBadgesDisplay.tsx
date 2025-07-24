import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';
import { cn } from '@app/utils/utils';
import { Trophy } from 'lucide-react';
import { Badge } from '@app/components/ui/badge';
import { rarityBorderMap, rarityColorMap } from '@app/config/rarity.config';
import type { BadgeId } from '@shared/types/ids';

export type UserBadge = {
	id: BadgeId;
	name: string;
	description?: string | null;
	iconUrl?: string | null;
	rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
	earnedAt?: string;
};

type UserBadgesDisplayProps = {
	badges: UserBadge[];
	activeBadgeId?: BadgeId | null;
	onSelectBadge?: (badgeId: BadgeId) => void;
	isSelectable?: boolean;
	maxDisplay?: number;
	className?: string;
	variant?: 'grid' | 'row';
	emptyMessage?: string;
	title?: string;
};

/**
 * Component for displaying a user's earned badges
 *
 * @param badges Array of user badges to display
 * @param activeBadgeId ID of the currently active/equipped badge
 * @param onSelectBadge Callback for when a badge is selected/clicked
 * @param isSelectable Whether badges can be selected
 * @param maxDisplay Maximum number of badges to display, shows "+X more" if exceeded
 * @param className Additional class names
 * @param variant Display style: grid or horizontal row
 * @param emptyMessage Message to display when no badges are earned
 * @param title Optional title for the component
 */
export function UserBadgesDisplay({
	badges,
	activeBadgeId,
	onSelectBadge,
	isSelectable = false,
	maxDisplay,
	className,
	variant = 'grid',
	emptyMessage = 'No badges earned yet',
	title
}: UserBadgesDisplayProps) {
	// Handle badge click
	const handleBadgeClick = (badge: UserBadge) => {
		if (isSelectable && onSelectBadge) {
			onSelectBadge(badge.id);
		}
	};

	// Filter badges to display
	const badgesToDisplay = maxDisplay ? badges.slice(0, maxDisplay) : badges;
	const remainingBadges = maxDisplay ? Math.max(0, badges.length - maxDisplay) : 0;

	// If no badges to display
	if (!badges || badges.length === 0) {
		return (
			<div className={cn('bg-zinc-850 rounded-lg p-4 border border-zinc-800', className)}>
				{title && <h3 className="font-medium mb-3">{title}</h3>}
				<div className="text-center py-6 text-zinc-500 text-sm italic">{emptyMessage}</div>
			</div>
		);
	}

	return (
		<div className={cn('bg-zinc-850 rounded-lg p-4 border border-zinc-800', className)}>
			{title && <h3 className="font-medium mb-3">{title}</h3>}

			<div
				className={cn(
					variant === 'grid'
						? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'
						: 'flex flex-row flex-wrap gap-2'
				)}
			>
				{badgesToDisplay.map((badge) => (
					<BadgeItem
						key={badge.id}
						badge={badge}
						isActive={badge.id === activeBadgeId}
						isSelectable={isSelectable}
						onClick={() => handleBadgeClick(badge)}
					/>
				))}

				{/* Show indicator if more badges exist than are displayed */}
				{remainingBadges > 0 && (
					<div className="flex items-center justify-center aspect-square bg-zinc-800/50 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-medium">
						+{remainingBadges} more
					</div>
				)}
			</div>
		</div>
	);
}

type BadgeItemProps = {
	badge: UserBadge;
	isActive?: boolean;
	isSelectable?: boolean;
	onClick: () => void;
};

function BadgeItem({ badge, isActive = false, isSelectable = false, onClick }: BadgeItemProps) {
	const rarityKey = (badge.rarity?.toLowerCase() || 'common') as keyof typeof rarityBorderMap;
	const borderColor = rarityBorderMap[rarityKey] || rarityBorderMap.common;

	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<div
						className={cn(
							'relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200',
							borderColor,
							isActive && 'ring-2 ring-offset-1 ring-offset-black ring-primary',
							isSelectable && 'cursor-pointer hover:scale-105'
						)}
						onClick={onClick}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								onClick();
								e.preventDefault();
							}
						}}
					>
						{/* Badge Image */}
						<div className="w-full h-full flex items-center justify-center p-2">
							{badge.iconUrl ? (
								<img
									src={badge.iconUrl}
									alt={badge.name}
									className="max-w-full max-h-full object-contain"
									onError={(e) => {
										// Fallback if image fails to load
										e.currentTarget.src = '/images/placeholder-badge.png';
									}}
								/>
							) : (
								<Trophy className="h-6 w-6 opacity-50" />
							)}
						</div>

						{/* Active Indicator */}
						{isActive && (
							<div className="absolute bottom-0 left-0 right-0 bg-primary py-0.5 text-[10px] text-center text-primary-foreground font-semibold">
								ACTIVE
							</div>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="bg-zinc-800 border-zinc-700">
					<div className="p-1">
						<p className="font-semibold text-sm">{badge.name}</p>
						{badge.description && <p className="text-xs text-zinc-300 mt-1">{badge.description}</p>}
						{badge.earnedAt && (
							<p className="text-[10px] text-zinc-400 mt-1">
								Earned {new Date(badge.earnedAt).toLocaleDateString()}
							</p>
						)}
						{badge.rarity && (
							<Badge className={cn('mt-1.5 text-[10px] capitalize', rarityColorMap[rarityKey])}>
								{badge.rarity}
							</Badge>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
