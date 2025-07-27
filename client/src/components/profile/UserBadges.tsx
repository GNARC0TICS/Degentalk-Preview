import React from 'react';
import { cn } from '@/utils/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { rarityBorderMap } from '@/config/rarity.config';
import type { BadgeId } from '@shared/types/ids';

// TODO: BadgeType import removed – local prop already typed without external schema

type UserBadgesProps = {
	badges: Array<{
		id: BadgeId;
		name: string;
		description?: string | null;
		iconUrl: string;
		rarity?: string;
	}>;
	activeBadgeId?: BadgeId | null;
	onSelectBadge?: (badgeId: BadgeId) => void;
	className?: string;
	editable?: boolean;
};

/**
 * UserBadges component for displaying a grid of user badges
 *
 * Features:
 * - Displays badges in a responsive grid
 * - Highlights the currently active badge
 * - Shows badge details on hover
 * - Optional click handler for badge selection
 */
export function UserBadges({
	badges,
	activeBadgeId,
	onSelectBadge,
	className,
	editable = false
}: UserBadgesProps) {
	if (!badges || badges.length === 0) {
		return (
			<div className={cn('bg-zinc-900 rounded-lg p-6 text-center', className)}>
				<p className="text-slate-500 text-sm italic">No badges earned yet</p>
			</div>
		);
	}

	return (
		<div className={cn('bg-zinc-900 rounded-lg p-4', className)}>
			<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
				{badges.map((badge) => (
					<BadgeItem
						key={badge.id}
						badge={badge}
						isActive={badge.id === activeBadgeId}
						onClick={editable ? () => onSelectBadge?.(badge.id) : undefined}
						interactive={editable}
					/>
				))}
			</div>
		</div>
	);
}

type BadgeItemProps = {
	badge: {
		id: BadgeId;
		name: string;
		description?: string | null;
		iconUrl: string;
		rarity?: string;
	};
	isActive?: boolean;
	onClick?: () => void;
	interactive?: boolean;
};

function BadgeItem({ badge, isActive = false, onClick, interactive = false }: BadgeItemProps) {
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
							isActive && 'ring-2 ring-offset-2 ring-offset-black ring-indigo-500',
							interactive && 'cursor-pointer hover:scale-105'
						)}
						onClick={onClick}
					>
						{/* Badge Image */}
						<div className="w-full h-full flex items-center justify-center p-2">
							<img
								src={badge.iconUrl}
								alt={badge.name}
								className="max-w-full max-h-full object-contain"
								onError={(e) => {
									e.currentTarget.src = '/images/ART/badge-placeholder.png';
								}}
							/>
						</div>

						{/* Active Indicator */}
						{isActive && (
							<div className="absolute bottom-0 left-0 right-0 bg-indigo-600 py-1 text-[10px] text-center text-white font-semibold">
								ACTIVE
							</div>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-white">
					<div className="p-1">
						<p className="font-semibold text-sm">{badge.name}</p>
						{badge.description && (
							<p className="text-xs text-slate-300 mt-1">{badge.description}</p>
						)}
						{badge.rarity && (
							<p
								className={cn(
									'text-[10px] mt-1 capitalize',
									rarityKey === 'common'
										? 'text-slate-400'
										: rarityKey === 'uncommon'
											? 'text-emerald-400'
											: rarityKey === 'rare'
												? 'text-blue-400'
												: rarityKey === 'epic'
													? 'text-purple-400'
													: 'text-amber-400'
								)}
							>
								{badge.rarity} Rarity
							</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
