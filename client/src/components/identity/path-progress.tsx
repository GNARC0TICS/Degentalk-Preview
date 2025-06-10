import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp, Sparkles } from 'lucide-react';
import { getPathDefinition, getDominantPath, availablePaths } from '@shared/path-config';

interface PathProgressProps {
	userId?: number;
	variant?: 'compact' | 'standard' | 'detailed';
	className?: string;
}

/**
 * Displays user's XP progress and path identity progression
 *
 * @param userId Optional user ID for viewing other user's progress, uses current user if not provided
 * @param variant Display variant (compact, standard, detailed)
 * @param className Additional CSS classes
 */
export function PathProgress({ userId, variant = 'standard', className }: PathProgressProps) {
	// Fetch user XP data from API
	const { data: userData, isLoading } = useQuery({
		queryKey: userId ? [`/api/users/${userId}/xp`] : ['/api/users/me/xp'],
		enabled: true
	});

	if (isLoading) {
		return (
			<Card className={cn('bg-zinc-900/50 border-zinc-800', className)}>
				<CardContent className="p-4">
					<div className="space-y-3">
						<div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
						<div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" />
						<div className="grid grid-cols-3 gap-2">
							<div className="h-12 bg-zinc-800 rounded animate-pulse" />
							<div className="h-12 bg-zinc-800 rounded animate-pulse" />
							<div className="h-12 bg-zinc-800 rounded animate-pulse" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Default values for development or when data isn't fully loaded
	const user = userData || {
		xp: 0,
		level: 1,
		pathXp: {},
		nextLevelXp: 100
	};

	// Calculate progress to next level
	const nextLevelXp = user.nextLevelXp || 100;
	const currentLevelXp = user.xp || 0;
	const progress = Math.min(Math.round((currentLevelXp / nextLevelXp) * 100), 100);

	// Get dominant path
	const dominantPathId = getDominantPath(user.pathXp as Record<string, number>);
	const dominantPath = getPathDefinition(dominantPathId || '');

	if (variant === 'compact') {
		return (
			<div className={cn('flex items-center space-x-3', className)}>
				<div className="flex items-center space-x-1">
					<div className="h-5 w-5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
						<Star className="h-3 w-3 text-black" />
					</div>
					<span className="text-sm font-medium">Lvl {user.level}</span>
				</div>
				<Progress value={progress} className="h-1 w-16" />
			</div>
		);
	}

	return (
		<Card
			className={cn(
				'bg-zinc-900/50 border-zinc-800 overflow-hidden transition-all hover:bg-zinc-900',
				variant === 'detailed' && 'glow-sm',
				className
			)}
		>
			<div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10 pointer-events-none" />

			<CardHeader className="p-4 pb-0">
				<CardTitle className="text-lg flex items-center space-x-2">
					<Trophy className="h-5 w-5 text-yellow-500" />
					<span>Level Progress</span>
				</CardTitle>
			</CardHeader>

			<CardContent className="p-4">
				<div className="space-y-4">
					{/* Level Progress */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<div className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center shadow-[0_0_8px_rgba(255,200,0,0.3)]">
									<span className="text-xs font-bold text-black">{user.level}</span>
								</div>
								<span className="text-sm font-medium text-white">Level {user.level}</span>
							</div>
							<span className="text-xs text-zinc-400">
								{currentLevelXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
							</span>
						</div>

						<div className="relative">
							<Progress
								value={progress}
								className="h-2"
								indicatorClassName="bg-gradient-to-r from-yellow-500 to-amber-500"
							/>

							{/* Sparkle effect at progress point */}
							<div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${progress}%` }}>
								<Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
							</div>
						</div>
					</div>

					{/* Identity Paths */}
					{variant === 'detailed' && (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-medium text-white">Identity Paths</h4>
								{dominantPath && (
									<div className="flex items-center space-x-1">
										<span className="text-xs">Dominant:</span>
										<span className="text-xs font-medium" style={{ color: dominantPath.color }}>
											{dominantPath.name}
										</span>
									</div>
								)}
							</div>

							<div className="grid grid-cols-3 gap-2">
								{Object.entries(availablePaths).map(([pathId, path]) => {
									const pathXp = (user.pathXp as Record<string, number>)[pathId] || 0;
									const isActive = pathId === dominantPathId;

									return (
										<div
											key={pathId}
											className={cn(
												'bg-black/40 backdrop-blur-sm border border-zinc-800 rounded-lg p-2',
												isActive && 'border-opacity-100',
												isActive && `border-${path.color}`
											)}
										>
											<div className="text-xs flex items-center space-x-1">
												<div className={`h-3 w-3 rounded-full bg-${path.color}`} />
												<span className="truncate">{path.name}</span>
											</div>
											<div className="text-xs mt-1 flex items-center">
												<TrendingUp className="mr-1 h-2 w-2 text-zinc-500" />
												<span className="text-zinc-400">{pathXp.toLocaleString()} XP</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
