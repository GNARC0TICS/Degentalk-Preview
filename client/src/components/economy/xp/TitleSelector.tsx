import React from 'react';
import { cn } from '@/lib/utils';
import { UserTitle } from '@/hooks/useXP';
import { Check, ChevronDown, Crown, Info } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type TitleSelectorProps = {
	titles: UserTitle[];
	equippedTitle: UserTitle | null;
	onEquipTitle: (titleId: string) => void;
	isLoading?: boolean;
	className?: string;
	compact?: boolean;
};

/**
 * Component for selecting from available titles
 */
export function TitleSelector({
	titles,
	equippedTitle,
	onEquipTitle,
	isLoading = false,
	className,
	compact = false
}: TitleSelectorProps) {
	// Get appropriate color class for title
	const getTitleColorClass = (color: string) => {
		switch (color) {
			case 'emerald':
				return 'text-emerald-400';
			case 'cyan':
				return 'text-cyan-400';
			case 'blue':
				return 'text-blue-400';
			case 'purple':
				return 'text-purple-400';
			case 'amber':
				return 'text-amber-400';
			case 'red':
				return 'text-red-400';
			case 'pink':
				return 'text-pink-400';
			case 'orange':
				return 'text-orange-400';
			default:
				return 'text-zinc-400';
		}
	};

	// Get rarity display color
	const getRarityColor = (rarity: UserTitle['rarity']) => {
		switch (rarity) {
			case 'common':
				return 'text-zinc-400';
			case 'uncommon':
				return 'text-emerald-400';
			case 'rare':
				return 'text-blue-400';
			case 'epic':
				return 'text-purple-400';
			case 'legendary':
				return 'text-amber-400';
			default:
				return 'text-zinc-400';
		}
	};

	// Format rarity text with first letter capitalized
	const formatRarity = (rarity: string) => {
		return rarity.charAt(0).toUpperCase() + rarity.slice(1);
	};

	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Titles</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="animate-pulse space-y-2">
						<div className="h-8 bg-zinc-800 rounded"></div>
						<div className="h-20 bg-zinc-800 rounded"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (titles.length === 0) {
		return (
			<Card className={className}>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Titles</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
						<Crown className="mb-2 h-12 w-12 opacity-20" />
						<p className="mb-1 text-sm">No titles yet</p>
						<p className="text-xs">Earn titles by leveling up and completing achievements</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Compact dropdown selector
	if (compact) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex items-center justify-between w-full">
						<div className="flex items-center">
							{equippedTitle ? (
								<span className={cn('font-medium', getTitleColorClass(equippedTitle.color))}>
									{equippedTitle.name}
								</span>
							) : (
								<span className="text-zinc-400">Select a title</span>
							)}
						</div>
						<ChevronDown className="h-4 w-4 ml-2 opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>Your Titles</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<ScrollArea className="h-[300px]">
						{titles.map((title) => (
							<DropdownMenuItem
								key={title.id}
								className={cn(
									'flex items-center justify-between cursor-pointer',
									title.isEquipped && 'bg-zinc-800'
								)}
								onClick={() => onEquipTitle(title.id)}
							>
								<div className="flex items-center">
									<span className={cn('font-medium', getTitleColorClass(title.color))}>
										{title.name}
									</span>
									<span className={cn('ml-2 text-xs', getRarityColor(title.rarity))}>
										({formatRarity(title.rarity)})
									</span>
								</div>
								{title.isEquipped && <Check className="h-4 w-4" />}
							</DropdownMenuItem>
						))}
					</ScrollArea>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	// Full card component
	return (
		<Card className={className}>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Titles</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="bg-zinc-850 p-3 rounded-md">
						<div className="flex justify-between items-start mb-2">
							<p className="text-sm text-zinc-400">Current Title</p>
							<TooltipProvider>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
											<Info className="h-3.5 w-3.5" />
											<span className="sr-only">Info</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent side="top" align="end" className="max-w-[200px]">
										<p className="text-xs">
											Titles are displayed next to your username in posts and on your profile
										</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						{equippedTitle ? (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span
										className={cn('font-medium text-lg', getTitleColorClass(equippedTitle.color))}
									>
										{equippedTitle.name}
									</span>
									<Badge
										variant="outline"
										className={cn(
											'text-xs',
											equippedTitle.rarity === 'legendary' &&
												'bg-gradient-to-r from-amber-500/30 to-orange-500/30'
										)}
									>
										{formatRarity(equippedTitle.rarity)}
									</Badge>
								</div>
							</div>
						) : (
							<p className="text-zinc-500 italic">No title equipped</p>
						)}
					</div>

					<div className="space-y-2">
						<p className="text-sm font-medium">Your Titles</p>
						<div className="grid gap-2">
							{titles.map((title) => (
								<div
									key={title.id}
									className={cn(
										'flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-zinc-850 transition-colors',
										title.isEquipped && 'bg-zinc-850 border border-zinc-700'
									)}
									onClick={() => onEquipTitle(title.id)}
								>
									<div className="flex items-center gap-2">
										<span className={cn('font-medium', getTitleColorClass(title.color))}>
											{title.name}
										</span>
										<Badge
											variant="outline"
											className={cn(
												'text-xs',
												title.rarity === 'legendary' &&
													'bg-gradient-to-r from-amber-500/30 to-orange-500/30'
											)}
										>
											{formatRarity(title.rarity)}
										</Badge>
									</div>
									{title.isEquipped ? (
										<Badge variant="default" className="bg-zinc-700">
											Equipped
										</Badge>
									) : (
										<Button variant="outline" size="sm" className="h-7 text-xs border-zinc-700">
											Equip
										</Button>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
