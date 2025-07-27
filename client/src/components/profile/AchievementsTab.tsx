/**
 * Achievements Tab Component
 *
 * Displays user achievements, progress, and statistics in the profile page.
 */

import React, { useState } from 'react';
import { useUserAchievements } from '@/hooks/use-achievements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loader';
import { Trophy, Star, Lock, Gift, Target, Crown, Sparkles } from 'lucide-react';
import type { ProfileData } from '@/types/profile';

interface AchievementsTabProps {
	profile: ProfileData;
	isOwnProfile?: boolean;
}

export default function AchievementsTab({ profile, isOwnProfile = false }: AchievementsTabProps) {
	const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'secret'>('all');

	const { data: userAchievements = [], isLoading } = useUserAchievements({
		completed: filter === 'completed' ? true : filter === 'in_progress' ? false : undefined
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	// Filter achievements based on selected filter
	const filteredAchievements = userAchievements.filter((ua) => {
		if (filter === 'secret') return ua.achievement.isSecret;
		if (filter === 'completed') return ua.isCompleted;
		if (filter === 'in_progress') return !ua.isCompleted && parseFloat(ua.progressPercentage) > 0;
		return true;
	});

	// Calculate statistics
	const totalAchievements = userAchievements.length;
	const completedAchievements = userAchievements.filter((ua) => ua.isCompleted).length;
	const completionRate =
		totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;
	const secretAchievements = userAchievements.filter(
		(ua) => ua.achievement.isSecret && ua.isCompleted
	).length;

	// Group achievements by category
	const achievementsByCategory = filteredAchievements.reduce(
		(acc, ua) => {
			const category = ua.achievement.category;
			if (!acc[category]) acc[category] = [];
			acc[category].push(ua);
			return acc;
		},
		{} as Record<string, typeof userAchievements>
	);

	const getTierColor = (tier: string) => {
		switch (tier) {
			case 'common':
				return 'bg-gray-500';
			case 'rare':
				return 'bg-blue-500';
			case 'epic':
				return 'bg-purple-500';
			case 'legendary':
				return 'bg-orange-500';
			case 'mythic':
				return 'bg-pink-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getTierIcon = (tier: string) => {
		switch (tier) {
			case 'legendary':
				return Crown;
			case 'mythic':
				return Sparkles;
			case 'epic':
				return Star;
			default:
				return Trophy;
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'cultural':
				return Gift;
			case 'secret':
				return Lock;
			case 'progression':
				return Target;
			default:
				return Trophy;
		}
	};

	return (
		<div className="space-y-6">
			{/* Achievement Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-zinc-800 border-zinc-700">
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-emerald-400">{completedAchievements}</div>
						<div className="text-sm text-zinc-400">Completed</div>
					</CardContent>
				</Card>

				<Card className="bg-zinc-800 border-zinc-700">
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-blue-400">{Math.round(completionRate)}%</div>
						<div className="text-sm text-zinc-400">Completion Rate</div>
					</CardContent>
				</Card>

				<Card className="bg-zinc-800 border-zinc-700">
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-purple-400">{secretAchievements}</div>
						<div className="text-sm text-zinc-400">Secret Unlocked</div>
					</CardContent>
				</Card>

				<Card className="bg-zinc-800 border-zinc-700">
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-amber-400">{totalAchievements}</div>
						<div className="text-sm text-zinc-400">Total Available</div>
					</CardContent>
				</Card>
			</div>

			{/* Filter Buttons */}
			<div className="flex flex-wrap gap-2">
				{[
					{ key: 'all', label: 'All', count: userAchievements.length },
					{ key: 'completed', label: 'Completed', count: completedAchievements },
					{
						key: 'in_progress',
						label: 'In Progress',
						count: userAchievements.filter(
							(ua) => !ua.isCompleted && parseFloat(ua.progressPercentage) > 0
						).length
					},
					{
						key: 'secret',
						label: 'Secret',
						count: userAchievements.filter((ua) => ua.achievement.isSecret).length
					}
				].map(({ key, label, count }) => (
					<Button
						key={key}
						variant={filter === key ? 'default' : 'outline'}
						size="sm"
						onClick={() => setFilter(key as any)}
						className="text-xs"
					>
						{label} ({count})
					</Button>
				))}
			</div>

			{/* Achievement List by Category */}
			<div className="space-y-6">
				{Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
					const CategoryIcon = getCategoryIcon(category);

					return (
						<div key={category} className="space-y-3">
							<div className="flex items-center gap-2">
								<CategoryIcon className="h-5 w-5 text-zinc-400" />
								<h3 className="text-lg font-semibold text-zinc-200 capitalize">
									{category.replace('_', ' ')}
								</h3>
								<Badge variant="outline" className="text-xs">
									{categoryAchievements.length}
								</Badge>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{categoryAchievements.map((userAchievement) => {
									const { achievement } = userAchievement;
									const TierIcon = getTierIcon(achievement.tier);
									const progress = parseFloat(userAchievement.progressPercentage);

									return (
										<Card
											key={userAchievement.id}
											className={`bg-zinc-800 border-zinc-700 transition-all hover:border-zinc-600 ${
												userAchievement.isCompleted ? 'ring-1 ring-emerald-500/30' : ''
											}`}
										>
											<CardHeader className="pb-3">
												<div className="flex items-start justify-between">
													<div className="flex items-center gap-2">
														{achievement.iconEmoji ? (
															<span className="text-2xl">{achievement.iconEmoji}</span>
														) : (
															<TierIcon className={`h-6 w-6 text-zinc-400`} />
														)}
														<div>
															<CardTitle className="text-base text-zinc-200">
																{achievement.name}
																{achievement.isSecret && (
																	<Lock className="h-4 w-4 inline ml-1 text-purple-400" />
																)}
															</CardTitle>
															<div className="flex items-center gap-2 mt-1">
																<Badge
																	variant="secondary"
																	className={`text-xs ${getTierColor(achievement.tier)} text-white`}
																>
																	{achievement.tier}
																</Badge>
																{userAchievement.isCompleted && (
																	<Badge
																		variant="outline"
																		className="text-xs text-emerald-400 border-emerald-400"
																	>
																		Completed
																	</Badge>
																)}
															</div>
														</div>
													</div>
													{userAchievement.isCompleted && (
														<Trophy className="h-5 w-5 text-emerald-400 flex-shrink-0" />
													)}
												</div>
											</CardHeader>

											<CardContent className="pt-0">
												<CardDescription className="text-zinc-400 text-sm mb-3">
													{achievement.description}
												</CardDescription>

												{!userAchievement.isCompleted && (
													<div className="space-y-2">
														<div className="flex justify-between text-xs text-zinc-400">
															<span>Progress</span>
															<span>{Math.round(progress)}%</span>
														</div>
														<Progress value={progress} className="h-2" />
													</div>
												)}

												{userAchievement.isCompleted && userAchievement.completedAt && (
													<div className="text-xs text-zinc-500">
														Completed on{' '}
														{new Date(userAchievement.completedAt).toLocaleDateString()}
													</div>
												)}

												{/* Rewards */}
												<div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
													{achievement.rewardXp > 0 && (
														<span className="flex items-center gap-1">
															<Star className="h-3 w-3" />
															{achievement.rewardXp} XP
														</span>
													)}
													{achievement.rewardDgt > 0 && (
														<span className="flex items-center gap-1">
															<Gift className="h-3 w-3" />
															{achievement.rewardDgt} DGT
														</span>
													)}
													{achievement.rewardReputation > 0 && (
														<span className="flex items-center gap-1">
															<Crown className="h-3 w-3" />
															{achievement.rewardReputation} Reputation
														</span>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			{filteredAchievements.length === 0 && (
				<Card className="bg-zinc-800 border-zinc-700">
					<CardContent className="p-8 text-center">
						<Trophy className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
						<CardTitle className="text-zinc-400 mb-2">No achievements found</CardTitle>
						<CardDescription className="text-zinc-500">
							{filter === 'completed' &&
								'No completed achievements yet. Keep participating to unlock them!'}
							{filter === 'in_progress' &&
								'No achievements in progress. Start posting and engaging to begin earning achievements!'}
							{filter === 'secret' &&
								'No secret achievements discovered yet. Keep exploring to find hidden achievements!'}
							{filter === 'all' && 'No achievements available.'}
						</CardDescription>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
