/**
 * ProfileGamificationWidget Component
 *
 * Compact gamification display for user profiles showing:
 * - Level and XP progress
 * - Recent achievements
 * - Mission streak
 * - Quick stats
 */

import { cn } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LevelDisplay } from './level-display';
import { formatNumber } from '@/utils/utils';
import { Trophy, Target, Flame, TrendingUp, ChevronRight, Sparkles, Award } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import type { UserProgression } from '@/features/gamification/services/gamification-api.service';

interface ProfileGamificationWidgetProps {
	progression: UserProgression;
	isOwnProfile?: boolean;
	className?: string;
}

export function ProfileGamificationWidget({
	progression,
	isOwnProfile = false,
	className
}: ProfileGamificationWidgetProps) {
	const navigate = useNavigate();

	// Calculate days until next level
	const getDaysToNextLevel = () => {
		if (!progression.weeklyXpGain || progression.weeklyXpGain === 0) return null;
		const dailyAverage = progression.weeklyXpGain / 7;
		const xpNeeded = progression.xpForNextLevel - progression.currentXp;
		const daysEstimate = Math.ceil(xpNeeded / dailyAverage);
		return daysEstimate;
	};

	const daysToNextLevel = getDaysToNextLevel();

	return (
		<Card className={cn('bg-zinc-900 border-zinc-800', className)}>
			<CardHeader className="pb-3">
				<CardTitle className="text-base flex items-center justify-between">
					<span className="flex items-center gap-2">
						<Sparkles className="w-4 h-4 text-purple-500" />
						Gamification Stats
					</span>
					{isOwnProfile && (
						<Button variant="ghost" size="sm" onClick={() => navigate('/progress')}>
							View All
							<ChevronRight className="w-4 h-4 ml-1" />
						</Button>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Level Progress */}
				<div className="flex items-start gap-3">
					<LevelDisplay
						level={progression.currentLevel}
						rarity={progression.levelInfo.rarity}
						size="lg"
						animated={false}
					/>

					<div className="flex-1 space-y-2">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-semibold">{progression.levelInfo.name}</p>
								<p className="text-xs text-muted-foreground">
									Rank #{progression.rank} • {formatNumber(progression.totalXp)} XP
								</p>
							</div>
							{progression.recentLevelUps > 0 && (
								<Badge className="bg-purple-600 text-xs">
									+{progression.recentLevelUps} this week
								</Badge>
							)}
						</div>

						<div>
							<div className="flex justify-between text-xs mb-1">
								<span className="text-muted-foreground">Level {progression.currentLevel + 1}</span>
								<span>{progression.progressPercentage}%</span>
							</div>
							<Progress value={progression.progressPercentage} className="h-1.5" />
							{daysToNextLevel && (
								<p className="text-xs text-muted-foreground mt-1">
									~{daysToNextLevel} days to next level
								</p>
							)}
						</div>
					</div>
				</div>

				<Separator className="bg-zinc-800" />

				{/* Quick Stats */}
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="p-2 rounded-md bg-zinc-800/50">
						<Trophy className="w-4 h-4 mx-auto mb-1 text-amber-500" />
						<p className="text-lg font-bold">{progression.achievements.total}</p>
						<p className="text-xs text-muted-foreground">Achievements</p>
					</div>

					<div className="p-2 rounded-md bg-zinc-800/50">
						<Target className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
						<p className="text-lg font-bold">{progression.missions.completed}</p>
						<p className="text-xs text-muted-foreground">Missions</p>
					</div>

					<div className="p-2 rounded-md bg-zinc-800/50">
						<Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
						<p className="text-lg font-bold">{progression.missions.streak}</p>
						<p className="text-xs text-muted-foreground">Day Streak</p>
					</div>
				</div>

				{/* Recent Achievements */}
				{progression.achievements.recent.length > 0 && (
					<>
						<Separator className="bg-zinc-800" />
						<div>
							<h4 className="text-sm font-medium mb-2 flex items-center justify-between">
								<span className="flex items-center gap-1">
									<Award className="w-4 h-4 text-purple-500" />
									Recent Achievements
								</span>
								<Badge variant="secondary" className="text-xs">
									{progression.achievements.recent.length} new
								</Badge>
							</h4>
							<div className="space-y-1.5">
								{progression.achievements.recent.slice(0, 2).map((achievement) => (
									<div
										key={achievement.id}
										className="flex items-center gap-2 p-1.5 bg-zinc-800/30 rounded"
									>
										<div className="w-6 h-6 rounded bg-purple-600/20 flex items-center justify-center">
											<Trophy className="w-3 h-3 text-purple-400" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium truncate">{achievement.name}</p>
										</div>
										<span className="text-xs text-muted-foreground">+{achievement.rewardXp}</span>
									</div>
								))}
							</div>
						</div>
					</>
				)}

				{/* Weekly Progress */}
				{progression.weeklyXpGain > 0 && (
					<div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-md">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-4 h-4 text-purple-400" />
							<span className="text-sm">This Week</span>
						</div>
						<span className="text-sm font-bold text-purple-300">
							+{formatNumber(progression.weeklyXpGain)} XP
						</span>
					</div>
				)}

				{/* View Full Profile */}
				{isOwnProfile && (
					<div className="grid grid-cols-2 gap-2 pt-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate('/progress?tab=achievements')}
						>
							<Trophy className="w-3 h-3 mr-1" />
							Achievements
						</Button>
						<Button variant="outline" size="sm" onClick={() => navigate('/about')}>
							<Info className="w-3 h-3 mr-1" />
							About
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
