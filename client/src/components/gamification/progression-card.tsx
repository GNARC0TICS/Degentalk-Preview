/**
 * ProgressionCard Component
 *
 * Comprehensive user progression display showing:
 * - Current level and XP progress
 * - Next level rewards
 * - Recent achievements
 * - Mission streak
 * - Leaderboard rank
 */

import { cn } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LevelDisplay } from './level-display';
import { formatNumber } from '@/utils/utils';
import { TrendingUp, Trophy, Target, Flame, ChevronRight, Sparkles, Zap, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import type { UserProgression } from '@/features/gamification/services/gamification-api.service';

interface ProgressionCardProps {
	progression: UserProgression;
	className?: string;
	variant?: 'full' | 'compact';
	onViewDetails?: () => void;
}

export function ProgressionCard({
	progression,
	className,
	variant = 'full',
	onViewDetails
}: ProgressionCardProps) {
	const navigate = useNavigate();

	// Animation for progress bar fill
	const progressVariants = {
		initial: { width: 0 },
		animate: {
			width: `${progression.progressPercentage}%`,
			transition: { duration: 1, ease: 'easeOut' }
		}
	};

	// Get level milestone rewards preview
	const getNextRewards = () => {
		const rewards = [];
		if (progression.nextLevelInfo?.rewards?.dgt) {
			rewards.push(`${progression.nextLevelInfo.rewards.dgt} DGT`);
		}
		if (progression.nextLevelInfo?.rewards?.titleId) {
			rewards.push('New Title');
		}
		if (progression.nextLevelInfo?.rewards?.badgeId) {
			rewards.push('New Badge');
		}
		return rewards;
	};

	const nextRewards = getNextRewards();

	if (variant === 'compact') {
		return (
			<Card className={cn('bg-zinc-900 border-zinc-800', className)}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-3">
							<LevelDisplay
								level={progression.currentLevel}
								rarity={progression.levelInfo.rarity}
								levelTitle={progression.levelInfo.name}
								size="md"
							/>
							<div>
								<p className="font-semibold">{progression.username}</p>
								<p className="text-sm text-muted-foreground">Rank #{progression.rank}</p>
							</div>
						</div>
						<Badge variant="secondary" className="bg-zinc-800">
							{formatNumber(progression.totalXp)} XP
						</Badge>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Next Level</span>
							<span>{formatNumber(progression.xpForNextLevel)} XP</span>
						</div>
						<Progress value={progression.progressPercentage} className="h-2" />
						<p className="text-xs text-right text-muted-foreground">
							{progression.progressPercentage}% Complete
						</p>
					</div>

					{onViewDetails && (
						<Button variant="ghost" size="sm" className="w-full mt-3" onClick={onViewDetails}>
							View Details
							<ChevronRight className="w-4 h-4 ml-1" />
						</Button>
					)}
				</CardContent>
			</Card>
		);
	}

	// Full variant
	return (
		<Card className={cn('bg-zinc-900 border-zinc-800 overflow-hidden', className)}>
			{/* Decorative header gradient */}
			<div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600" />

			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Progression Overview</span>
					<Badge variant="outline" className="bg-zinc-800">
						<TrendingUp className="w-3 h-3 mr-1" />+{formatNumber(progression.weeklyXpGain)} XP this
						week
					</Badge>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Level and XP Section */}
				<div className="flex items-start gap-4">
					<LevelDisplay
						level={progression.currentLevel}
						rarity={progression.levelInfo.rarity}
						levelTitle={progression.levelInfo.name}
						size="xl"
					/>

					<div className="flex-1 space-y-3">
						<div>
							<div className="flex items-center justify-between mb-1">
								<h3 className="font-semibold">{progression.username}</h3>
								<Badge className="bg-gradient-to-r from-amber-600 to-orange-600">
									Rank #{progression.rank}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{progression.levelInfo.name} • {formatNumber(progression.totalXp)} Total XP
							</p>
						</div>

						<div>
							<div className="flex justify-between text-sm mb-1">
								<span className="text-muted-foreground">
									Progress to Level {progression.currentLevel + 1}
								</span>
								<span>
									{formatNumber(progression.currentXp)} / {formatNumber(progression.xpForNextLevel)}
								</span>
							</div>
							<div className="relative">
								<Progress value={0} className="h-3" />
								<motion.div
									className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
									variants={progressVariants}
									initial="initial"
									animate="animate"
								/>
							</div>
							<p className="text-xs text-right text-muted-foreground mt-1">
								{progression.progressPercentage}% Complete
							</p>
						</div>

						{/* Next level rewards */}
						{nextRewards.length > 0 && (
							<div className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-md">
								<Gift className="w-4 h-4 text-amber-500" />
								<span className="text-sm">Next rewards: {nextRewards.join(' • ')}</span>
							</div>
						)}
					</div>
				</div>

				<Separator className="bg-zinc-800" />

				{/* Stats Grid */}
				<div className="grid grid-cols-3 gap-4">
					<div className="text-center">
						<div className="flex items-center justify-center mb-1">
							<Trophy className="w-5 h-5 text-amber-500" />
						</div>
						<p className="text-2xl font-bold">{progression.achievements.total}</p>
						<p className="text-xs text-muted-foreground">Achievements</p>
					</div>

					<div className="text-center">
						<div className="flex items-center justify-center mb-1">
							<Target className="w-5 h-5 text-emerald-500" />
						</div>
						<p className="text-2xl font-bold">{progression.missions.completed}</p>
						<p className="text-xs text-muted-foreground">Missions Done</p>
					</div>

					<div className="text-center">
						<div className="flex items-center justify-center mb-1">
							<Flame className="w-5 h-5 text-orange-500" />
						</div>
						<p className="text-2xl font-bold">{progression.missions.streak}</p>
						<p className="text-xs text-muted-foreground">Day Streak</p>
					</div>
				</div>

				{/* Recent Achievements */}
				{progression.achievements.recent.length > 0 && (
					<>
						<Separator className="bg-zinc-800" />
						<div>
							<h4 className="text-sm font-medium mb-2 flex items-center">
								<Sparkles className="w-4 h-4 mr-1 text-purple-500" />
								Recent Achievements
							</h4>
							<div className="space-y-2">
								{progression.achievements.recent.slice(0, 3).map((achievement) => (
									<div
										key={achievement.id}
										className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-md"
									>
										<div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
											<Trophy className="w-4 h-4 text-purple-400" />
										</div>
										<div className="flex-1">
											<p className="text-sm font-medium">{achievement.name}</p>
											<p className="text-xs text-muted-foreground">+{achievement.rewardXp} XP</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</>
				)}

				{/* Recent level ups */}
				{progression.recentLevelUps > 0 && (
					<div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-md border border-purple-800/50">
						<Zap className="w-5 h-5 text-purple-400" />
						<p className="text-sm">
							<span className="font-medium text-purple-300">
								{progression.recentLevelUps} level{progression.recentLevelUps > 1 ? 's' : ''}
							</span>{' '}
							gained this week! Keep it up!
						</p>
					</div>
				)}

				{/* Action buttons */}
				<div className="flex gap-2">
					<Button variant="outline" className="flex-1" onClick={() => navigate('/leaderboard')}>
						<Trophy className="w-4 h-4 mr-2" />
						Leaderboard
					</Button>
					<Button variant="outline" className="flex-1" onClick={() => navigate('/achievements')}>
						<Sparkles className="w-4 h-4 mr-2" />
						Achievements
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
