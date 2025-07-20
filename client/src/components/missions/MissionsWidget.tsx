import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMissions } from '@/hooks/useMissions';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ChevronRight, Gift, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';

/**
 * Small widget showing active missions with rewards ready to claim
 * Designed to be used in a sidebar or dashboard
 */
export function MissionsWidget() {
	const { missionsWithProgress, isLoading, getDailyMissions, getWeeklyMissions } = useMissions();
	const navigate = useNavigate();

	// Skip rendering if still loading or no data
	if (isLoading || !missionsWithProgress) {
		return null;
	}

	// Get daily and weekly missions
	const dailyMissions = getDailyMissions();
	const weeklyMissions = getWeeklyMissions();

	// Count missions with rewards ready to claim
	const claimableMissionsCount = missionsWithProgress.filter(
		(m) => m.progress?.isCompleted && !m.progress?.isRewardClaimed
	).length;

	// Get the mission that's closest to completion
	const inProgressMissions = missionsWithProgress.filter(
		(m) => !m.progress?.isCompleted && m.progress?.currentCount > 0
	);

	// Sort by completion percentage
	inProgressMissions.sort((a, b) => {
		const aPercent = (a.progress?.currentCount || 0) / a.requiredCount;
		const bPercent = (b.progress?.currentCount || 0) / b.requiredCount;
		return bPercent - aPercent;
	});

	// Get the mission closest to completion
	const nextMission = inProgressMissions[0];

	// Count total active missions
	const totalActiveMissions = dailyMissions.length + weeklyMissions.length;

	// Calculate total completed missions
	const completedMissions = missionsWithProgress.filter((m) => m.progress?.isCompleted).length;

	// If no missions are active, don't render the widget
	if (totalActiveMissions === 0) {
		return null;
	}

	// Navigation to missions page
	const goToMissions = () => {
		navigate('/missions');
	};

	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardHeader className="pb-2">
				<CardTitle className="text-base flex items-center">
					<Trophy className="h-4 w-4 mr-2 text-amber-500" />
					Daily Missions
				</CardTitle>
			</CardHeader>

			<CardContent className="pb-2">
				{claimableMissionsCount > 0 ? (
					<motion.div
						initial={{ opacity: 0.8, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							repeat: Infinity,
							repeatType: 'reverse',
							duration: 1.5
						}}
						className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/10 p-3 rounded-md border border-emerald-700/50 mb-3"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Gift className="h-5 w-5 mr-2 text-emerald-400" />
								<span className="font-medium text-emerald-300">
									{claimableMissionsCount} {claimableMissionsCount === 1 ? 'reward' : 'rewards'}{' '}
									ready!
								</span>
							</div>
							<Badge className="bg-emerald-600">{claimableMissionsCount}</Badge>
						</div>
					</motion.div>
				) : nextMission ? (
					<div className="p-3 bg-zinc-800/30 rounded-md mb-3">
						<div className="flex justify-between items-center mb-1 text-sm">
							<span>{nextMission.title}</span>
							<span className="text-zinc-400">
								{nextMission.progress?.currentCount}/{nextMission.requiredCount}
							</span>
						</div>
						<Progress
							value={((nextMission.progress?.currentCount || 0) * 100) / nextMission.requiredCount}
							className="h-1.5 bg-zinc-700"
						/>
					</div>
				) : null}

				<div className="flex flex-col space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-zinc-400">Daily Missions</span>
						<Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-700">
							{dailyMissions.length}
						</Badge>
					</div>

					<div className="flex justify-between">
						<span className="text-zinc-400">Weekly Missions</span>
						<Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-700">
							{weeklyMissions.length}
						</Badge>
					</div>

					<div className="flex justify-between">
						<span className="text-zinc-400">Completed</span>
						<span className="font-medium">
							{completedMissions}/{totalActiveMissions}
						</span>
					</div>
				</div>
			</CardContent>

			<CardFooter className="pt-2">
				<Button
					variant="ghost"
					className="w-full justify-between hover:bg-zinc-800 text-zinc-300"
					onClick={goToMissions}
				>
					<span className="flex items-center">
						<Clock className="h-4 w-4 mr-2 text-zinc-400" />
						View All Missions
					</span>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}

export default MissionsWidget;
