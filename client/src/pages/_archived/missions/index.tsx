import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@app/hooks/use-auth';
import { useGamification } from '@app/hooks/use-gamification';
import { MissionDashboard } from '@app/components/gamification';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Trophy, Target, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Focused missions page that displays actionable tasks like
 * daily, weekly, and event missions.
 */
export default function MissionsPage() {
	const { user } = useAuth();
	const { missions, isLoading, claimMissionReward, isClaimingReward } = useGamification();

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<div className="text-center space-y-4">
					<RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500" />
					<p className="text-muted-foreground">Loading your missions...</p>
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
					<AlertDescription>Please log in to view your missions.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Error state or no missions
	if (!missions) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<Alert className="max-w-md" variant="destructive">
					<AlertCircle className="w-4 h-4" />
					<AlertDescription>
						Failed to load mission data. Please try refreshing the page.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<>
			<Helmet>
				<title>Missions | Degentalk</title>
				<meta name="description" content="Complete daily, weekly, and special event missions." />
			</Helmet>

			<div className="container py-8 max-w-6xl space-y-8">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold flex items-center">
							<Target className="mr-3 h-8 w-8 text-purple-500" />
							Missions & Quests
						</h1>
						<p className="text-zinc-400 mt-1">Complete tasks to earn XP, DGT, and other rewards.</p>
					</div>
					<Link to="/progress">
						<Button variant="outline">
							View Full Progress Hub
							<ChevronRight className="w-4 h-4 ml-2" />
						</Button>
					</Link>
				</div>

				{/* Main missions list */}
				<MissionDashboard
					missions={missions}
					onClaimReward={claimMissionReward}
					isClaimingReward={isClaimingReward}
				/>

				{/* Achievements Link Card */}
				<Card className="bg-gradient-to-r from-amber-950/30 to-orange-950/30 border-amber-800/50">
					<CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<Trophy className="w-8 h-8 text-amber-400" />
							<div>
								<h3 className="font-semibold text-lg">Track Your Achievements</h3>
								<p className="text-sm text-zinc-300">
									View all your unlocked achievements and overall progress.
								</p>
							</div>
						</div>
						<Link to="/progress?tab=achievements">
							<Button variant="secondary" className="bg-amber-600/20 hover:bg-amber-600/40">
								View Achievements
								<ChevronRight className="w-4 h-4 ml-2" />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
