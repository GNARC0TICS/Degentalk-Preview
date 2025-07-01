/**
 * Progress Page
 *
 * Main hub for all gamification features including:
 * - User progression overview
 * - Achievement tracking
 * - Mission management
 * - Leaderboard viewing
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGamification } from '@/hooks/use-gamification';
import {
	ProgressionCard,
	AchievementGrid,
	MissionDashboard,
	Leaderboard,
	LevelUpModal,
	AchievementUnlockModal
} from '@/components/gamification';
import { Trophy, Target, TrendingUp, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { gamificationApi } from '@/features/gamification/services/gamification-api.service';

export default function GamificationPage() {
	const { user } = useAuth();
	const {
		progression,
		achievements,
		missions,
		leaderboard,
		isLoading,
		claimMissionReward,
		isClaimingReward,
		getClaimableMissions
	} = useGamification();

	const [activeTab, setActiveTab] = useState('overview');
	const [leaderboardType, setLeaderboardType] = useState<'level' | 'xp' | 'weekly' | 'monthly'>(
		'xp'
	);
	const [showLevelUpModal, setShowLevelUpModal] = useState(false);
	const [showAchievementModal, setShowAchievementModal] = useState<any>(null);

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<div className="text-center space-y-4">
					<RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
					<p className="text-muted-foreground">Loading your progress data...</p>
				</div>
			</div>
		);
	}

	// Not authenticated
	if (!user) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<Alert className="max-w-md">
					<AlertCircle className="w-4 h-4" />
					<AlertDescription>Please log in to view your progress.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Error state
	if (!progression) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<Alert className="max-w-md" variant="destructive">
					<AlertCircle className="w-4 h-4" />
					<AlertDescription>
						Failed to load progress data. Please try refreshing the page.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const claimableMissions = getClaimableMissions();

	return (
		<>
			<Helmet>
				<title>Progress - Degentalk</title>
				<meta
					name="description"
					content="Track your progress, unlock achievements, and compete with other traders"
				/>
			</Helmet>

			<div className="min-h-screen bg-zinc-950">
				<div className="container mx-auto px-4 py-8 space-y-8">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center space-y-4"
					>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
							Progress Hub
						</h1>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Track your progress, unlock achievements, complete missions, and compete with fellow
							traders in the ultimate crypto forum experience.
						</p>
					</motion.div>

					{/* Quick Actions Alert */}
					{claimableMissions.length > 0 && (
						<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
							<Alert className="bg-green-900/20 border-green-700">
								<Trophy className="w-4 h-4" />
								<AlertDescription className="flex items-center justify-between">
									<span>
										🎉 You have {claimableMissions.length} mission reward
										{claimableMissions.length > 1 ? 's' : ''} ready to claim!
									</span>
									<Button size="sm" variant="outline" onClick={() => setActiveTab('missions')}>
										View Missions
									</Button>
								</AlertDescription>
							</Alert>
						</motion.div>
					)}

					{/* Main Content Tabs */}
					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
						<TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
							<TabsTrigger value="overview" className="flex items-center gap-2">
								<Sparkles className="w-4 h-4" />
								Overview
							</TabsTrigger>
							<TabsTrigger value="achievements" className="flex items-center gap-2">
								<Trophy className="w-4 h-4" />
								Achievements
							</TabsTrigger>
							<TabsTrigger value="missions" className="flex items-center gap-2">
								<Target className="w-4 h-4" />
								Missions
								{claimableMissions.length > 0 && (
									<span className="ml-1 px-1.5 py-0.5 text-xs bg-green-600 rounded-full">
										{claimableMissions.length}
									</span>
								)}
							</TabsTrigger>
							<TabsTrigger value="leaderboard" className="flex items-center gap-2">
								<TrendingUp className="w-4 h-4" />
								Leaderboard
							</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value="overview">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
							>
								<ProgressionCard progression={progression} className="max-w-4xl mx-auto" />
							</motion.div>
						</TabsContent>

						{/* Achievements Tab */}
						<TabsContent value="achievements">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
							>
								{achievements ? (
									<AchievementGrid
										achievements={achievements.all}
										categories={{
											content: achievements.all.filter((a) => a.achievement.category === 'content'),
											social: achievements.all.filter((a) => a.achievement.category === 'social'),
											economy: achievements.all.filter((a) => a.achievement.category === 'economy'),
											progression: achievements.all.filter(
												(a) => a.achievement.category === 'progression'
											),
											special: achievements.all.filter((a) => a.achievement.category === 'special')
										}}
										stats={achievements.stats}
										onAchievementClick={(achievement) => setShowAchievementModal(achievement)}
									/>
								) : (
									<div className="text-center py-12">
										<Trophy className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
										<p className="text-muted-foreground">No achievement data available</p>
									</div>
								)}
							</motion.div>
						</TabsContent>

						{/* Missions Tab */}
						<TabsContent value="missions">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
							>
								{missions ? (
									<MissionDashboard
										missions={missions}
										onClaimReward={claimMissionReward}
										isClaimingReward={isClaimingReward}
										streak={progression.missions.streak}
									/>
								) : (
									<div className="text-center py-12">
										<Target className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
										<p className="text-muted-foreground">No mission data available</p>
									</div>
								)}
							</motion.div>
						</TabsContent>

						{/* Leaderboard Tab */}
						<TabsContent value="leaderboard">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
							>
								{leaderboard ? (
									<Leaderboard
										entries={leaderboard}
										currentUserId={user.id}
										type={leaderboardType}
										onTypeChange={setLeaderboardType}
									/>
								) : (
									<div className="text-center py-12">
										<TrendingUp className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
										<p className="text-muted-foreground">No leaderboard data available</p>
									</div>
								)}
							</motion.div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Modals */}
				<LevelUpModal
					isOpen={showLevelUpModal}
					onClose={() => setShowLevelUpModal(false)}
					previousLevel={progression.currentLevel - 1}
					newLevel={progression.currentLevel}
					levelInfo={progression.levelInfo}
					rewards={progression.levelInfo.rewards}
				/>

				<AchievementUnlockModal
					isOpen={!!showAchievementModal}
					onClose={() => setShowAchievementModal(null)}
					achievement={showAchievementModal?.achievement}
					onShare={() => {
						// TODO: Implement sharing functionality
					}}
				/>
			</div>
		</>
	);
}

