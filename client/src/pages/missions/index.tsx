import React from 'react';
import { Helmet as Head } from 'react-helmet'; // Changed from next/head
import { DailyMissions } from '@/components/missions/DailyMissions';
import { Sparkles, Trophy, Gift, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; // Changed path
import { useMissions } from '@/hooks/useMissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Basic type definition for missions, consider moving to a shared types file
interface MissionProgress {
	isCompleted: boolean;
	isRewardClaimed: boolean;
	// Add other progress fields if necessary, e.g., current_value, target_value
}

interface Mission {
	id: string | number; // Assuming id can be string or number
	xpReward: number;
	dgtReward?: number;
	// Add other mission fields if necessary, e.g., title, description
}

interface MissionWithProgress extends Mission {
	progress?: MissionProgress;
}

/**
 * Main missions page that displays all available missions
 * and user's progress
 */
export default function MissionsPage() {
	const { user } = useAuth();
	const { missionsWithProgress } = useMissions();

	// Calculate mission stats
	const totalMissionsCount = missionsWithProgress?.length || 0;
	const completedMissionsCount =
		missionsWithProgress?.filter((m: MissionWithProgress) => m.progress?.isCompleted).length || 0;
	const claimableMissionsCount =
		missionsWithProgress?.filter(
			(m: MissionWithProgress) => m.progress?.isCompleted && !m.progress?.isRewardClaimed
		).length || 0;

	// Calculate total possible XP and DGT rewards
	const totalPossibleXP =
		missionsWithProgress?.reduce((sum: number, mission: MissionWithProgress) => {
			if (!mission.progress?.isRewardClaimed) {
				return sum + mission.xpReward;
			}
			return sum;
		}, 0) || 0;

	const totalPossibleDGT =
		missionsWithProgress?.reduce((sum: number, mission: MissionWithProgress) => {
			if (!mission.progress?.isRewardClaimed && mission.dgtReward) {
				return sum + mission.dgtReward;
			}
			return sum;
		}, 0) || 0;

	// Calculate completion percentage for the progress display
	const completionPercentage =
		totalMissionsCount > 0 ? (completedMissionsCount / totalMissionsCount) * 100 : 0;

	return (
		<>
			<Head>
				<title>Daily Missions | DegenTalk</title>
			</Head>

			<div className="container py-6 max-w-6xl">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
					<div>
						<h1 className="text-3xl font-bold flex items-center">
							<Trophy className="mr-3 h-8 w-8 text-amber-500" />
							Daily Missions & Quests
						</h1>
						<p className="text-zinc-400 mt-1">
							Complete missions to earn XP, DGT rewards, and badges
						</p>
					</div>

					{user && (
						<div className="flex flex-wrap gap-4">
							{/* XP available card */}
							<Card className="bg-gradient-to-br from-blue-950 to-blue-900/50 border-blue-800 shadow">
								<CardContent className="p-4 flex items-center gap-3">
									<div className="rounded-full bg-blue-900/50 border border-blue-700 p-2">
										<Sparkles className="h-5 w-5 text-blue-300" />
									</div>
									<div>
										<div className="text-blue-300 text-sm">Total XP Available</div>
										<div className="text-xl font-bold">{totalPossibleXP} XP</div>
									</div>
								</CardContent>
							</Card>

							{/* DGT available card */}
							{totalPossibleDGT > 0 && (
								<Card className="bg-gradient-to-br from-purple-950 to-purple-900/50 border-purple-800 shadow">
									<CardContent className="p-4 flex items-center gap-3">
										<div className="rounded-full bg-purple-900/50 border border-purple-700 p-2">
											<Gift className="h-5 w-5 text-purple-300" />
										</div>
										<div>
											<div className="text-purple-300 text-sm">Total DGT Available</div>
											<div className="text-xl font-bold">{totalPossibleDGT} DGT</div>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</div>

				{user && (
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						{/* Mission stats */}
						<Card className="bg-zinc-900 border-zinc-800 col-span-3">
							<CardHeader className="pb-2">
								<CardTitle className="text-xl">Mission Progress</CardTitle>
								<CardDescription>Your progress on active missions</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-4 justify-between">
									<div className="flex items-center gap-4">
										<div className="h-16 w-16">
											<CircularProgressbar
												value={completionPercentage}
												text={`${Math.round(completionPercentage)}%`}
												strokeWidth={10}
												styles={buildStyles({
													textColor: '#10b981',
													pathColor: '#10b981',
													trailColor: '#27272a',
													textSize: '1.5rem'
												})}
											/>
										</div>
										<div className="space-y-1">
											<div className="text-sm text-zinc-400">Completion Rate</div>
											<div className="text-xl font-semibold">
												{completedMissionsCount}/{totalMissionsCount} Missions
											</div>
										</div>
									</div>

									<div className="flex gap-6">
										<div className="space-y-1">
											<div className="text-sm text-zinc-400">Claimable Rewards</div>
											<div className="text-xl font-semibold flex items-center">
												<Gift className="h-5 w-5 mr-2 text-emerald-500" />
												{claimableMissionsCount}{' '}
												{claimableMissionsCount === 1 ? 'Mission' : 'Missions'}
											</div>
										</div>

										<div className="space-y-1">
											<div className="text-sm text-zinc-400">Reset Schedule</div>
											<div className="text-xl font-semibold flex items-center">
												<Calendar className="h-5 w-5 mr-2 text-blue-500" />
												Daily & Weekly
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Info/Tip card */}
						<Card className="bg-gradient-to-br from-amber-950/50 to-zinc-900 border-amber-800/50">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center">
									<Gift className="h-5 w-5 mr-2 text-amber-500" />
									Mission Tip
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-zinc-300">
									Daily missions reset every 24 hours. Make sure to claim your rewards before they
									reset!
								</p>
								<p className="text-sm text-zinc-400 mt-2">
									Weekly missions give bigger rewards and reset every 7 days.
								</p>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Main missions list */}
				<DailyMissions />
			</div>
		</>
	);
}
