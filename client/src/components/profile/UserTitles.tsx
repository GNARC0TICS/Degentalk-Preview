import React from 'react';
import { cn } from '@app/utils/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@app/components/ui/tooltip';
import { Badge } from '@app/components/ui/badge';
import { rarityBorderMap, rarityColorMap } from '@app/config/rarity.config';
import type { TitleId } from '@shared/types/ids';

type UserTitlesProps = {
	titles: Array<{
		id: TitleId;
		name: string;
		description?: string | null;
		iconUrl?: string | null;
		rarity?: string;
	}>;
	activeTitleId?: TitleId | null;
	onSelectTitle?: (titleId: TitleId) => void;
	className?: string;
	editable?: boolean;
};

/**
 * UserTitles component for displaying a list of user titles
 *
 * Features:
 * - Displays titles in a scrollable list
 * - Highlights the currently active title
 * - Shows title details on hover
 * - Optional click handler for title selection
 */
export function UserTitles({
	titles,
	activeTitleId,
	onSelectTitle,
	className,
	editable = false
}: UserTitlesProps) {
	if (!titles || titles.length === 0) {
		return (
			<div className={cn('bg-zinc-900 rounded-lg p-6 text-center', className)}>
				<p className="text-slate-500 text-sm italic">No titles earned yet</p>
			</div>
		);
	}

	return (
		<div className={cn('bg-zinc-900 rounded-lg p-4', className)}>
			<div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700">
				{titles.map((title) => (
					<TitleItem
						key={title.id}
						title={title}
						isActive={title.id === activeTitleId}
						onClick={editable ? () => onSelectTitle?.(title.id) : undefined}
						interactive={editable}
					/>
				))}
			</div>
		</div>
	);
}

type TitleItemProps = {
	title: {
		id: TitleId;
		name: string;
		description?: string | null;
		iconUrl?: string | null;
		rarity?: string;
	};
	isActive?: boolean;
	onClick?: () => void;
	interactive?: boolean;
};

function TitleItem({ title, isActive = false, onClick, interactive = false }: TitleItemProps) {
	const rarityKey = (title.rarity?.toLowerCase() || 'common') as keyof typeof rarityBorderMap;
	const colorClasses = cn(
		rarityBorderMap[rarityKey] || rarityBorderMap.common,
		rarityColorMap[rarityKey] ? rarityColorMap[rarityKey].replace('text-', '') : ''
	);

	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<div
						className={cn(
							'relative px-3 py-2 rounded-md border transition-all duration-200 flex items-center',
							colorClasses,
							isActive && 'ring-2 ring-indigo-500',
							interactive && 'cursor-pointer hover:brightness-110'
						)}
						onClick={onClick}
					>
						{/* Title Icon (if available) */}
						{title.iconUrl && (
							<div className="w-8 h-8 mr-3 flex-shrink-0">
								<img
									src={title.iconUrl}
									alt=""
									className="w-full h-full object-contain"
									onError={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							</div>
						)}

						{/* Title Name */}
						<div className="flex-grow">
							<p className="font-semibold">{title.name}</p>
						</div>

						{/* Active Indicator */}
						{isActive && (
							<Badge className="ml-2 bg-indigo-600 text-white text-[10px]">ACTIVE</Badge>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-white">
					<div className="p-1">
						<p className="font-semibold text-sm">{title.name}</p>
						{title.description && (
							<p className="text-xs text-slate-300 mt-1">{title.description}</p>
						)}
						{title.rarity && <p className="text-[10px] mt-1 capitalize">{title.rarity} Rarity</p>}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
