import React from 'react';
import { cn } from '@/lib/utils';
import type { UserBadge } from '@/hooks/useXP';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type BadgeShowcaseProps = {
	badges: UserBadge[];
	isLoading?: boolean;
	className?: string;
	variant?: 'grid' | 'list';
};

/**
 * Component for showcasing user badges with hover effects for details
 */
export function BadgeShowcase({
	badges,
	isLoading = false,
	className,
	variant = 'grid'
}: BadgeShowcaseProps) {
	// Function to determine badge border color based on rarity
	const getBadgeRarityColor = (rarity: UserBadge['rarity']) => {
		switch (rarity) {
			case 'common':
				return 'from-zinc-400 to-zinc-500';
			case 'uncommon':
				return 'from-emerald-400 to-emerald-500';
			case 'rare':
				return 'from-blue-400 to-blue-500';
			case 'epic':
				return 'from-purple-400 to-purple-500';
			case 'legendary':
				return 'from-amber-400 to-amber-500';
			default:
				return 'from-zinc-400 to-zinc-500';
		}
	};

	// Function to determine badge background glow based on rarity
	const getBadgeGlowClass = (rarity: UserBadge['rarity']) => {
		switch (rarity) {
			case 'common':
				return '';
			case 'uncommon':
				return 'animate-pulse-subtle';
			case 'rare':
				return 'animate-pulse-glow';
			case 'epic':
				return 'animate-pulse-glow shadow-lg';
			case 'legendary':
				return 'animate-pulse-glow shadow-xl';
			default:
				return '';
		}
	};

	// Capitalize the first letter of the badge rarity
	const formatRarity = (rarity: string) => {
		return rarity.charAt(0).toUpperCase() + rarity.slice(1);
	};

	if (isLoading) {
		return (
			<Card className={className}>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Badges</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 animate-pulse">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className="aspect-square rounded-md bg-zinc-800 flex items-center justify-center"
							></div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!badges || badges.length === 0) {
		return (
			<Card className={className}>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Badges</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
						<div className="mb-2 h-16 w-16 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
							<span className="text-2xl opacity-20">?</span>
						</div>
						<p className="mb-1 text-sm">No badges yet</p>
						<p className="text-xs">Badges are earned by participating in the community</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Badges</CardTitle>
			</CardHeader>
			<CardContent>
				{variant === 'grid' ? (
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
						{badges.map((badge) => (
							<TooltipProvider key={badge.id}>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<div
											className={cn(
												'aspect-square rounded-md bg-zinc-850 border-2 flex items-center justify-center overflow-hidden relative cursor-help group',
												getBadgeGlowClass(badge.rarity)
											)}
											style={{
												borderImage: `linear-gradient(to bottom right, ${getBadgeRarityColor(
													badge.rarity
												)}) 1`
											}}
										>
											<img
												src={badge.imageUrl}
												alt={badge.name}
												className="object-contain w-3/4 h-3/4 group-hover:scale-110 transition-transform"
											/>
										</div>
									</TooltipTrigger>
									<TooltipContent side="top" align="center" className="max-w-[200px]">
										<div className="text-center">
											<p className="font-semibold">{badge.name}</p>
											<Badge
												variant="outline"
												className={cn(
													'mt-1 text-xs',
													badge.rarity === 'legendary' &&
														'bg-gradient-to-r from-amber-500/30 to-orange-500/30'
												)}
											>
												{formatRarity(badge.rarity)}
											</Badge>
											<p className="text-xs mt-2 text-zinc-400">{badge.description}</p>
											<p className="text-xs mt-1.5 text-zinc-500">
												Earned{' '}
												{formatDistanceToNow(new Date(badge.earnedAt), {
													addSuffix: true
												})}
											</p>
										</div>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						))}
					</div>
				) : (
					<div className="space-y-3">
						{badges.map((badge) => (
							<div
								key={badge.id}
								className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-850 transition-colors"
							>
								<div
									className={cn(
										'w-12 h-12 rounded-md bg-zinc-850 border-2 flex items-center justify-center overflow-hidden relative',
										getBadgeGlowClass(badge.rarity)
									)}
									style={{
										borderImage: `linear-gradient(to bottom right, ${getBadgeRarityColor(
											badge.rarity
										)}) 1`
									}}
								>
									<img
										src={badge.imageUrl}
										alt={badge.name}
										className="object-contain w-3/4 h-3/4"
									/>
								</div>
								<div>
									<div className="flex items-center gap-2">
										<p className="font-medium text-sm">{badge.name}</p>
										<Badge
											variant="outline"
											className={cn(
												'text-xs',
												badge.rarity === 'legendary' &&
													'bg-gradient-to-r from-amber-500/30 to-orange-500/30'
											)}
										>
											{formatRarity(badge.rarity)}
										</Badge>
									</div>
									<p className="text-xs text-zinc-400">{badge.description}</p>
									<p className="text-xs text-zinc-500">
										Earned{' '}
										{formatDistanceToNow(new Date(badge.earnedAt), {
											addSuffix: true
										})}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
