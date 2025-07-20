/**
 * MissionDashboard Component
 *
 * Main dashboard for displaying and managing user missions
 */

import { cn } from '@/utils/utils';
import { MissionCard } from './mission-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Target,
	Calendar,
	CalendarDays,
	Trophy,
	Flame,
	Gift,
	TrendingUp,
	AlertCircle,
	Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import type {
	MissionProgress,
	Mission
} from '@/features/gamification/services/gamification-api.service';
import type { MissionId } from '@shared/types/ids';

interface MissionDashboardProps {
	missions: {
		all: MissionProgress[];
		completed: MissionProgress[];
		readyToClaim: MissionProgress[];
		inProgress: MissionProgress[];
		notStarted: Mission[];
		claimed: MissionProgress[];
		stats: {
			total: number;
			completed: number;
			readyToClaim: number;
			inProgress: number;
			claimed: number;
			completionRate: number;
			earnedRewards: number;
			totalPossibleRewards: number;
			rewardEfficiency: number;
		};
	};
	onClaimReward: (missionId: MissionId) => void;
	isClaimingReward?: boolean;
	streak?: number;
	className?: string;
}

export function MissionDashboard({
	missions,
	onClaimReward,
	isClaimingReward = false,
	streak = 0,
	className
}: MissionDashboardProps) {
	// Group missions by type
	const dailyMissions = missions.all.filter((m) => m.mission.isDaily);
	const weeklyMissions = missions.all.filter((m) => m.mission.isWeekly);
	const specialMissions = missions.all.filter((m) => !m.mission.isDaily && !m.mission.isWeekly);

	// Animation for claim all button
	const claimAllVariants = {
		idle: { scale: 1 },
		hover: { scale: 1.05 },
		tap: { scale: 0.95 }
	};

	// Get active tab based on what missions are available
	const getDefaultTab = () => {
		if (missions.readyToClaim.length > 0) return 'claimable';
		if (dailyMissions.length > 0) return 'daily';
		if (weeklyMissions.length > 0) return 'weekly';
		return 'all';
	};

	return (
		<div className={cn('space-y-6', className)}>
			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="bg-zinc-900 border-zinc-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Daily Streak</p>
								<p className="text-2xl font-bold flex items-center gap-2">
									{streak}
									<Flame
										className={cn('w-5 h-5', streak > 0 ? 'text-orange-500' : 'text-zinc-600')}
									/>
								</p>
							</div>
							{streak >= 7 && <Badge className="bg-orange-600">🔥 On Fire!</Badge>}
						</div>
					</CardContent>
				</Card>

				<Card className="bg-zinc-900 border-zinc-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Completed</p>
								<p className="text-2xl font-bold">
									{missions.stats.completed}/{missions.stats.total}
								</p>
							</div>
							<Trophy className="w-5 h-5 text-amber-500" />
						</div>
						<Progress value={missions.stats.completionRate} className="h-1 mt-2" />
					</CardContent>
				</Card>

				<Card className="bg-zinc-900 border-zinc-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Ready to Claim</p>
								<p className="text-2xl font-bold text-green-400">{missions.stats.readyToClaim}</p>
							</div>
							<Gift className="w-5 h-5 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-zinc-900 border-zinc-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">XP Earned</p>
								<p className="text-2xl font-bold">{missions.stats.earnedRewards}</p>
							</div>
							<TrendingUp className="w-5 h-5 text-purple-500" />
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{missions.stats.rewardEfficiency}% efficiency
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Claim All Alert */}
			{missions.readyToClaim.length > 1 && (
				<Alert className="bg-green-900/20 border-green-700">
					<Gift className="w-4 h-4" />
					<AlertDescription className="flex items-center justify-between">
						<span>You have {missions.readyToClaim.length} missions ready to claim!</span>
						<motion.div variants={claimAllVariants} whileHover="hover" whileTap="tap">
							<Button
								size="sm"
								className="bg-green-600 hover:bg-green-700"
								onClick={() => {
									missions.readyToClaim.forEach((m) => onClaimReward(m.missionId));
								}}
								disabled={isClaimingReward}
							>
								<Sparkles className="w-4 h-4 mr-1" />
								Claim All Rewards
							</Button>
						</motion.div>
					</AlertDescription>
				</Alert>
			)}

			{/* Mission Tabs */}
			<Tabs defaultValue={getDefaultTab()} className="space-y-4">
				<TabsList className="grid grid-cols-5 w-full">
					<TabsTrigger value="all" className="flex items-center gap-2">
						<Target className="w-4 h-4" />
						All
						<Badge variant="secondary" className="ml-1">
							{missions.all.length}
						</Badge>
					</TabsTrigger>

					<TabsTrigger value="daily" className="flex items-center gap-2">
						<Calendar className="w-4 h-4" />
						Daily
						<Badge variant="secondary" className="ml-1 bg-blue-600">
							{dailyMissions.length}
						</Badge>
					</TabsTrigger>

					<TabsTrigger value="weekly" className="flex items-center gap-2">
						<CalendarDays className="w-4 h-4" />
						Weekly
						<Badge variant="secondary" className="ml-1 bg-purple-600">
							{weeklyMissions.length}
						</Badge>
					</TabsTrigger>

					<TabsTrigger value="claimable" className="flex items-center gap-2">
						<Gift className="w-4 h-4" />
						Ready
						{missions.readyToClaim.length > 0 && (
							<Badge variant="secondary" className="ml-1 bg-green-600 animate-pulse">
								{missions.readyToClaim.length}
							</Badge>
						)}
					</TabsTrigger>

					<TabsTrigger value="completed" className="flex items-center gap-2">
						<Trophy className="w-4 h-4" />
						Done
						<Badge variant="secondary" className="ml-1">
							{missions.claimed.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				{/* All Missions */}
				<TabsContent value="all" className="space-y-4">
					{missions.all.length > 0 ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{missions.all.map((mission) => (
								<MissionCard
									key={mission.id}
									mission={mission}
									onClaim={() => onClaimReward(mission.missionId)}
									isClaimingReward={isClaimingReward}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={Target}
							title="No missions available"
							description="Check back later for new missions!"
						/>
					)}
				</TabsContent>

				{/* Daily Missions */}
				<TabsContent value="daily" className="space-y-4">
					{dailyMissions.length > 0 ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{dailyMissions.map((mission) => (
								<MissionCard
									key={mission.id}
									mission={mission}
									onClaim={() => onClaimReward(mission.missionId)}
									isClaimingReward={isClaimingReward}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={Calendar}
							title="No daily missions"
							description="Daily missions reset at midnight UTC"
						/>
					)}
				</TabsContent>

				{/* Weekly Missions */}
				<TabsContent value="weekly" className="space-y-4">
					{weeklyMissions.length > 0 ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{weeklyMissions.map((mission) => (
								<MissionCard
									key={mission.id}
									mission={mission}
									onClaim={() => onClaimReward(mission.missionId)}
									isClaimingReward={isClaimingReward}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={CalendarDays}
							title="No weekly missions"
							description="Weekly missions reset every Monday"
						/>
					)}
				</TabsContent>

				{/* Claimable Missions */}
				<TabsContent value="claimable" className="space-y-4">
					{missions.readyToClaim.length > 0 ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{missions.readyToClaim.map((mission) => (
								<MissionCard
									key={mission.id}
									mission={mission}
									onClaim={() => onClaimReward(mission.missionId)}
									isClaimingReward={isClaimingReward}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={Gift}
							title="No rewards to claim"
							description="Complete missions to earn rewards!"
						/>
					)}
				</TabsContent>

				{/* Completed Missions */}
				<TabsContent value="completed" className="space-y-4">
					{missions.claimed.length > 0 ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{missions.claimed.map((mission) => (
								<MissionCard key={mission.id} mission={mission} />
							))}
						</div>
					) : (
						<EmptyState
							icon={Trophy}
							title="No completed missions yet"
							description="Start completing missions to see them here!"
						/>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

// Empty state component
function EmptyState({
	icon: Icon,
	title,
	description
}: {
	icon: React.ElementType;
	title: string;
	description: string;
}) {
	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardContent className="flex flex-col items-center justify-center py-12 text-center">
				<Icon className="w-12 h-12 text-zinc-600 mb-4" />
				<CardTitle className="text-lg mb-2">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardContent>
		</Card>
	);
}
