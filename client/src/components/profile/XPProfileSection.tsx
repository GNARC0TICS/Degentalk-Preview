import React, { useState, useEffect } from 'react';
import { useXP } from '@/hooks/useXP';
import { XPProgressBar } from '@/features/gamification/components/XPProgressBar';
import { XPHistoryLog } from '@/features/gamification/components/XPHistoryLog';
import { BadgeShowcase } from '@/features/gamification/components/BadgeShowcase';
import { TitleSelector } from '@/features/gamification/components/TitleSelector';
import { LevelUpNotification } from '@/features/gamification/components/LevelUpNotification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

type XPProfileSectionProps = {
	userId?: string;
	className?: string;
};

/**
 * Component that combines XP-related components for a user profile page
 */
export function XPProfileSection({ userId, className }: XPProfileSectionProps) {
	const { xpData, xpHistory, isLoading, equipTitle } = useXP(userId);

	// Level-up notification (controlled via XP hooks in future)
	const [showLevelUp, setShowLevelUp] = useState(false);

	useEffect(() => {
		if (xpData?.pendingRewards) {
			setShowLevelUp(true);
		}
	}, [xpData?.pendingRewards]);

	if (isLoading) {
		return (
			<div className={className}>
				<div className="animate-pulse space-y-6">
					<div className="h-40 bg-zinc-800 rounded-lg"></div>
					<div className="h-64 bg-zinc-800 rounded-lg"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			{/* Level progress section */}
			<div className="mb-6">
				<XPProgressBar
					level={xpData.level}
					currentXP={xpData.currentLevelXP}
					nextLevelXP={xpData.nextLevelXP}
					progressPercent={xpData.progressToNextLevel}
					showProBadge={xpData.level >= 25}
				/>

				{/* Debug button removed */}
			</div>

			{/* Tabs for XP history, badges, and titles */}
			<Tabs defaultValue="history" className="w-full">
				<TabsList className="grid grid-cols-3 mb-6">
					<TabsTrigger value="history">Activity</TabsTrigger>
					<TabsTrigger value="badges">Badges</TabsTrigger>
					<TabsTrigger value="titles">Titles</TabsTrigger>
				</TabsList>

				<TabsContent value="history" className="mt-0">
					<XPHistoryLog xpHistory={xpHistory} />
				</TabsContent>

				<TabsContent value="badges" className="mt-0">
					<BadgeShowcase badges={xpData.badges} />
				</TabsContent>

				<TabsContent value="titles" className="mt-0">
					<TitleSelector
						titles={xpData.titles}
						equippedTitle={xpData.equippedTitle}
						onEquipTitle={equipTitle}
					/>
				</TabsContent>
			</Tabs>

			{/* Level up notification placeholder (hook-driven) */}
			{showLevelUp && (
				<LevelUpNotification
					level={xpData.level}
					isVisible={showLevelUp}
					onClose={() => setShowLevelUp(false)}
					rewards={xpData.pendingRewards}
				/>
			)}
		</div>
	);
}
