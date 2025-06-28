/**
 * AchievementGrid Component
 *
 * Displays a grid of achievements with filtering and sorting options
 */

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AchievementCard } from './achievement-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Filter, SortAsc, Sparkles, Target, CheckCircle2, Clock } from 'lucide-react';
import type { UserAchievement } from '@/features/gamification/services/gamification-api.service';

interface AchievementGridProps {
	achievements: UserAchievement[];
	categories: Record<string, UserAchievement[]>;
	stats?: {
		total: number;
		completed: number;
		inProgress: number;
		completionRate: number;
	};
	onAchievementClick?: (achievement: UserAchievement) => void;
	className?: string;
}

export function AchievementGrid({
	achievements,
	categories,
	stats,
	onAchievementClick,
	className
}: AchievementGridProps) {
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'progress' | 'rarity' | 'xp'>('progress');
	const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null);

	// Filter and sort achievements
	const displayedAchievements = useMemo(() => {
		let filtered = selectedCategory === 'all' ? achievements : categories[selectedCategory] || [];

		// Apply completion filter
		if (filterCompleted !== null) {
			filtered = filtered.filter((a) => a.isCompleted === filterCompleted);
		}

		// Sort achievements
		return [...filtered].sort((a, b) => {
			switch (sortBy) {
				case 'progress':
					return b.progressPercentage - a.progressPercentage;
				case 'rarity':
					const rarityOrder = { mythic: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
					return (
						(rarityOrder[b.achievement.rarity] || 0) - (rarityOrder[a.achievement.rarity] || 0)
					);
				case 'xp':
					return b.achievement.rewardXp - a.achievement.rewardXp;
				default:
					return 0;
			}
		});
	}, [achievements, categories, selectedCategory, sortBy, filterCompleted]);

	// Get category stats
	const getCategoryStats = (category: string) => {
		const categoryAchievements = categories[category] || [];
		const completed = categoryAchievements.filter((a) => a.isCompleted).length;
		return {
			total: categoryAchievements.length,
			completed,
			percentage:
				categoryAchievements.length > 0
					? Math.round((completed / categoryAchievements.length) * 100)
					: 0
		};
	};

	return (
		<div className={cn('space-y-6', className)}>
			{/* Overall Stats */}
			{stats && (
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="w-5 h-5 text-amber-500" />
							Achievement Progress
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<div className="flex justify-between mb-2">
									<span className="text-sm text-muted-foreground">Overall Completion</span>
									<span className="text-sm font-medium">
										{stats.completed} / {stats.total} ({stats.completionRate}%)
									</span>
								</div>
								<Progress value={stats.completionRate} className="h-2" />
							</div>

							<div className="grid grid-cols-3 gap-4 pt-2">
								<div className="text-center">
									<CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-green-500" />
									<p className="text-2xl font-bold">{stats.completed}</p>
									<p className="text-xs text-muted-foreground">Completed</p>
								</div>
								<div className="text-center">
									<Target className="w-8 h-8 mx-auto mb-1 text-amber-500" />
									<p className="text-2xl font-bold">{stats.inProgress}</p>
									<p className="text-xs text-muted-foreground">In Progress</p>
								</div>
								<div className="text-center">
									<Clock className="w-8 h-8 mx-auto mb-1 text-blue-500" />
									<p className="text-2xl font-bold">
										{stats.total - stats.completed - stats.inProgress}
									</p>
									<p className="text-xs text-muted-foreground">Not Started</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Filters and Sorting */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex gap-2 flex-1">
					<Button
						variant={filterCompleted === null ? 'default' : 'outline'}
						size="sm"
						onClick={() => setFilterCompleted(null)}
					>
						All
					</Button>
					<Button
						variant={filterCompleted === false ? 'default' : 'outline'}
						size="sm"
						onClick={() => setFilterCompleted(false)}
					>
						<Target className="w-4 h-4 mr-1" />
						In Progress
					</Button>
					<Button
						variant={filterCompleted === true ? 'default' : 'outline'}
						size="sm"
						onClick={() => setFilterCompleted(true)}
					>
						<CheckCircle2 className="w-4 h-4 mr-1" />
						Completed
					</Button>
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const options: Array<'progress' | 'rarity' | 'xp'> = ['progress', 'rarity', 'xp'];
							const currentIndex = options.indexOf(sortBy);
							const nextIndex = (currentIndex + 1) % options.length;
							setSortBy(options[nextIndex]);
						}}
					>
						<SortAsc className="w-4 h-4 mr-1" />
						Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
					</Button>
				</div>
			</div>

			{/* Category Tabs */}
			<Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
				<TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 h-auto bg-transparent">
					<TabsTrigger value="all" className="data-[state=active]:bg-zinc-800">
						<div className="flex flex-col items-center gap-1 py-2">
							<Sparkles className="w-4 h-4" />
							<span className="text-xs">All</span>
							<Badge variant="secondary" className="text-xs">
								{achievements.length}
							</Badge>
						</div>
					</TabsTrigger>

					{Object.entries(categories).map(([category, categoryAchievements]) => {
						const categoryStats = getCategoryStats(category);
						return (
							<TabsTrigger
								key={category}
								value={category}
								className="data-[state=active]:bg-zinc-800"
							>
								<div className="flex flex-col items-center gap-1 py-2">
									<Trophy className="w-4 h-4" />
									<span className="text-xs capitalize">{category}</span>
									<Badge
										variant="secondary"
										className={cn(
											'text-xs',
											categoryStats.percentage === 100 && 'bg-green-600 text-white'
										)}
									>
										{categoryStats.completed}/{categoryStats.total}
									</Badge>
								</div>
							</TabsTrigger>
						);
					})}
				</TabsList>

				<TabsContent value={selectedCategory} className="mt-6">
					{displayedAchievements.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{displayedAchievements.map((achievement) => (
								<AchievementCard
									key={achievement.achievementId}
									achievement={achievement}
									onClick={() => onAchievementClick?.(achievement)}
								/>
							))}
						</div>
					) : (
						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="flex flex-col items-center justify-center py-12 text-center">
								<Trophy className="w-12 h-12 text-zinc-600 mb-4" />
								<p className="text-lg font-medium mb-2">No achievements found</p>
								<p className="text-sm text-muted-foreground">
									{filterCompleted === true
										? "You haven't completed any achievements in this category yet."
										: filterCompleted === false
											? "You don't have any achievements in progress in this category."
											: 'No achievements available in this category.'}
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
