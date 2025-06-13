import React from 'react';
import { cn } from '@/lib/utils';
import type { Title } from '@schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

type UserTitlesProps = {
	titles: Array<{
		id: number;
		name: string;
		description?: string | null;
		iconUrl?: string | null;
		rarity?: string;
	}>;
	activeTitleId?: number | null;
	onSelectTitle?: (titleId: number) => void;
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
		id: number;
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
	const rarityColors = {
		common: 'bg-slate-900 border-slate-700 text-slate-300',
		uncommon: 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300',
		rare: 'bg-blue-900/30 border-blue-700/50 text-blue-300',
		epic: 'bg-purple-900/30 border-purple-700/50 text-purple-300',
		legendary: 'bg-amber-900/30 border-amber-700/50 text-amber-300'
	};

	const rarity = (title.rarity?.toLowerCase() || 'common') as keyof typeof rarityColors;
	const colorClasses = rarityColors[rarity] || rarityColors.common;

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
						{title.rarity && (
							<p
								className={cn(
									'text-[10px] mt-1 capitalize',
									rarity === 'common'
										? 'text-slate-400'
										: rarity === 'uncommon'
											? 'text-emerald-400'
											: rarity === 'rare'
												? 'text-blue-400'
												: rarity === 'epic'
													? 'text-purple-400'
													: 'text-amber-400'
								)}
							>
								{title.rarity} Rarity
							</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
