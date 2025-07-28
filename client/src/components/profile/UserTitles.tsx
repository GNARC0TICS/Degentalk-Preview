import React from 'react';
import { cn } from '@/utils/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { UserTitle } from '@/components/ui/user-title';
import type { TitleId } from '@shared/types/ids';
import type { Title } from '@shared/types/entities/title.types';

type UserTitlesProps = {
	titles: Title[];
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
	title: Title;
	isActive?: boolean;
	onClick?: () => void;
	interactive?: boolean;
};

function TitleItem({ title, isActive = false, onClick, interactive = false }: TitleItemProps) {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<div
						className={cn(
							'relative px-3 py-3 rounded-md border border-zinc-700 bg-zinc-800/50 transition-all duration-200 flex items-center gap-3',
							isActive && 'ring-2 ring-indigo-500 bg-zinc-800',
							interactive && 'cursor-pointer hover:bg-zinc-800'
						)}
						onClick={onClick}
					>
						{/* Title Preview */}
						<div className="flex-shrink-0">
							<UserTitle 
								title={title}
								className="scale-90"
							/>
						</div>

						{/* Title Info */}
						<div className="flex-grow min-w-0">
							<p className="font-medium text-sm text-zinc-200 truncate">{title.name}</p>
							{title.description && (
								<p className="text-xs text-zinc-400 truncate">{title.description}</p>
							)}
						</div>

						{/* Active Indicator */}
						{isActive && (
							<Badge className="ml-2 bg-indigo-600 text-white text-[10px] flex-shrink-0">
								EQUIPPED
							</Badge>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="bg-zinc-800 border-zinc-700 text-white">
					<div className="p-2 max-w-xs">
						<div className="mb-2">
							<UserTitle title={title} />
						</div>
						{title.description && (
							<p className="text-xs text-slate-300 mb-1">{title.description}</p>
						)}
						<div className="flex items-center gap-2 text-[10px] text-slate-400">
							{title.rarity && <span className="capitalize">{title.rarity}</span>}
							{title.category && <span className="capitalize">{title.category}</span>}
						</div>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
