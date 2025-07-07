import React, { useState } from 'react';
import { useMissions } from '@/hooks/useMissions';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Calendar,
	Trophy,
	CheckCircle,
	Circle,
	Clock,
	Sparkles,
	Gift,
	Award,
	AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { MissionId } from '@/types/ids';
import { type MissionId } from "@shared/types";

/**
 * Mission Card component to display a single mission
 */
interface MissionCardProps {
	mission: ReturnType<typeof useMissions>['missionsWithProgress'][0];
	onClaim: (id: MissionId) => void;
	isClaimingReward: boolean;
	expirationTime: string | null;
}

const MissionCard: React.FC<MissionCardProps> = ({
	mission,
	onClaim,
	isClaimingReward,
	expirationTime
}) => {
	const {
		id,
		title,
		description,
		requiredCount,
		xpReward,
		dgtReward,
		badgeReward,
		icon,
		progress,
		isDaily
	} = mission;

	const [isHovered, setIsHovered] = useState(false);

	// Function to get the appropriate icon component
	const getIconComponent = () => {
		switch (icon) {
			case 'log-in':
				return <Clock className="h-5 w-5" />;
			case 'message-square-plus':
				return <Circle className="h-5 w-5" />;
			case 'thumbs-up':
				return <CheckCircle className="h-5 w-5" />;
			case 'plus-circle':
				return <Calendar className="h-5 w-5" />;
			case 'reply':
				return <Calendar className="h-5 w-5" />;
			case 'gift':
				return <Gift className="h-5 w-5" />;
			default:
				return <Trophy className="h-5 w-5" />;
		}
	};

	// Progress percentage calculation
	const progressPercent = Math.min(
		Math.max(((progress?.currentCount || 0) * 100) / requiredCount, 0),
		100
	);

	return (
		<motion.div
			whileHover={{ y: -5 }}
			whileTap={{ scale: 0.98 }}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			className="h-full"
		>
			<Card
				className={cn(
					'h-full flex flex-col border-transparent transition-all duration-300',
					progress?.isCompleted && !progress?.isRewardClaimed
						? 'bg-gradient-to-b from-emerald-950 to-zinc-900 border-emerald-700'
						: 'bg-zinc-900',
					isHovered && 'border-zinc-700'
				)}
			>
				<CardHeader className="pb-2">
					<div className="flex justify-between items-start">
						<div className="flex items-center">
							<div
								className={cn(
									'mr-2 h-8 w-8 rounded-full flex items-center justify-center',
									isDaily ? 'bg-blue-900/30' : 'bg-purple-900/30'
								)}
							>
								{getIconComponent()}
							</div>
							<div>
								<CardTitle className="text-lg">{title}</CardTitle>
								<CardDescription className="mt-1">{description}</CardDescription>
							</div>
						</div>

						<Badge
							variant={isDaily ? 'default' : 'secondary'}
							className={cn(
								'capitalize',
								isDaily ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
							)}
						>
							{isDaily ? 'Daily' : 'Weekly'}
						</Badge>
					</div>
				</CardHeader>

				<CardContent className="pb-2 flex-grow">
					<div className="space-y-4">
						<div className="flex justify-between text-sm text-zinc-400">
							<span>Progress:</span>
							<span className="font-medium">
								{progress?.currentCount || 0} / {requiredCount}
							</span>
						</div>

						<Progress
							value={progressPercent}
							className={cn(
								'h-2',
								progress?.isCompleted
									? 'bg-zinc-800' // Base background for the track
									: 'bg-zinc-800'
								// If custom indicator color is needed for completed state,
								// it would require modifying the Progress component itself
								// or applying a different className to the Progress root
								// that targets the indicator internally if possible.
								// For now, removing indicatorClassName.
							)}
							// indicatorClassName removed
						/>

						<div className="flex flex-wrap gap-2 mt-2">
							{xpReward > 0 && (
								<Badge variant="outline" className="bg-blue-950/30 border-blue-800 text-blue-300">
									<Sparkles className="h-3 w-3 mr-1" />
									{xpReward} XP
								</Badge>
							)}

							{dgtReward && dgtReward > 0 && (
								<Badge
									variant="outline"
									className="bg-purple-950/30 border-purple-800 text-purple-300"
								>
									<Gift className="h-3 w-3 mr-1" />
									{dgtReward} DGT
								</Badge>
							)}

							{badgeReward && (
								<Badge
									variant="outline"
									className="bg-amber-950/30 border-amber-800 text-amber-300"
								>
									<Award className="h-3 w-3 mr-1" />
									{badgeReward}
								</Badge>
							)}
						</div>
					</div>
				</CardContent>

				<CardFooter className="pt-2">
					{progress?.isRewardClaimed ? (
						<Button
							variant="ghost"
							className="w-full bg-zinc-800/50 text-zinc-400 cursor-default"
							disabled
						>
							<CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
							Completed
						</Button>
					) : progress?.isCompleted ? (
						<Button
							variant="default"
							className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
							onClick={() => onClaim(id)}
							disabled={isClaimingReward}
						>
							<Gift className="h-4 w-4 mr-2" />
							Claim Reward
						</Button>
					) : (
						<div className="w-full flex justify-between items-center text-sm text-zinc-500">
							<div className="flex items-center">
								<Clock className="h-4 w-4 mr-1 text-zinc-400" />
								{expirationTime ? `Expires in ${expirationTime}` : 'Mission active'}
							</div>
							<div>
								{progress?.currentCount || 0}/{requiredCount} completed
							</div>
						</div>
					)}
				</CardFooter>
			</Card>
		</motion.div>
	);
};

/**
 * Empty state for when there are no missions
 */
const EmptyMissionsState: React.FC = () => (
	<Card className="flex flex-col items-center justify-center py-10 bg-zinc-900 border-zinc-800">
		<AlertCircle className="h-12 w-12 text-zinc-700 mb-4" />
		<h3 className="text-xl font-bold">No Missions Available</h3>
		<p className="text-zinc-500 max-w-sm text-center mt-2">
			There are no active missions available at the moment. Check back later!
		</p>
	</Card>
);

/**
 * Loading state for missions
 */
const MissionLoadingState: React.FC = () => (
	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{[1, 2, 3, 4, 5, 6].map((i) => (
			<Card key={i} className="bg-zinc-900 border-zinc-800">
				<CardHeader className="pb-2">
					<div className="flex items-start gap-2">
						<Skeleton className="h-8 w-8 rounded-full" />
						<div className="space-y-2 flex-1">
							<Skeleton className="h-5 w-full max-w-[150px]" />
							<Skeleton className="h-4 w-full" />
						</div>
					</div>
				</CardHeader>
				<CardContent className="pb-2">
					<div className="space-y-4">
						<div className="flex justify-between">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-12" />
						</div>
						<Skeleton className="h-2 w-full" />
						<div className="flex gap-2">
							<Skeleton className="h-6 w-16 rounded-full" />
							<Skeleton className="h-6 w-16 rounded-full" />
						</div>
					</div>
				</CardContent>
				<CardFooter className="pt-2">
					<Skeleton className="h-9 w-full rounded-md" />
				</CardFooter>
			</Card>
		))}
	</div>
);

/**
 * Complete Missions component
 */
export function DailyMissions() {
	const {
		missionsWithProgress,
		isLoading,
		claimReward,
		isClaimingReward,
		getExpirationTime,
		getDailyMissions,
		getWeeklyMissions
	} = useMissions();
	const { user } = useAuth();

	if (!user) {
		return (
			<Card className="bg-zinc-900 border-zinc-800">
				<CardHeader>
					<CardTitle>Daily Missions</CardTitle>
					<CardDescription>Log in to view your missions</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (isLoading) {
		return <MissionLoadingState />;
	}

	const dailyMissions = getDailyMissions();
	const weeklyMissions = getWeeklyMissions();

	const renderMissionsList = (missions: typeof missionsWithProgress) => {
		if (!missions || missions.length === 0) {
			return <EmptyMissionsState />;
		}

		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{missions.map((mission: (typeof missionsWithProgress)[0]) => (
					<MissionCard
						key={mission.id}
						mission={mission}
						onClaim={claimReward}
						isClaimingReward={isClaimingReward}
						expirationTime={getExpirationTime(mission)}
					/>
				))}
			</div>
		);
	};

	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardHeader>
				<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
					<div>
						<CardTitle className="flex items-center">
							<Trophy className="h-5 w-5 mr-2 text-amber-500" />
							Daily Missions
						</CardTitle>
						<CardDescription>Complete missions to earn XP, DGT, and badges</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="daily" className="w-full">
					<TabsList className="mb-4">
						<TabsTrigger value="daily" className="flex items-center">
							<Calendar className="h-4 w-4 mr-2" />
							Daily
							{dailyMissions.length > 0 && (
								<Badge className="ml-2 bg-blue-600 text-blue-50">{dailyMissions.length}</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="weekly" className="flex items-center">
							<Trophy className="h-4 w-4 mr-2" />
							Weekly
							{weeklyMissions.length > 0 && (
								<Badge className="ml-2 bg-purple-600 text-purple-50">{weeklyMissions.length}</Badge>
							)}
						</TabsTrigger>
					</TabsList>

					<ScrollArea className="w-full max-h-[600px] overflow-auto pr-4">
						<TabsContent value="daily" className="mt-0">
							{renderMissionsList(dailyMissions)}
						</TabsContent>

						<TabsContent value="weekly" className="mt-0">
							{renderMissionsList(weeklyMissions)}
						</TabsContent>
					</ScrollArea>
				</Tabs>
			</CardContent>
		</Card>
	);
}

export default DailyMissions;
