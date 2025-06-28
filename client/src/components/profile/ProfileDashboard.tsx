import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useProfileStats } from '@/hooks/useProfileStats';
import {
	ReputationCard,
	ActivityStatsCard,
	WalletOverviewCard,
	SocialStatsCard,
	MilestoneCard
} from './widgets';
import { QuickActionsCard } from './widgets/QuickActionsCard';
import { ProfileInsightsCard } from './widgets/ProfileInsightsCard';
import type { ProfileData } from '@/types/profile';

interface ProfileDashboardProps {
	profile: ProfileData;
	isOwnProfile: boolean;
}

const WIDGET_VARIANTS = {
	hidden: { opacity: 0, y: 20, scale: 0.95 },
	visible: { opacity: 1, y: 0, scale: 1 },
	exit: { opacity: 0, y: -20, scale: 0.95 }
};

const STAGGER_DELAY = 0.1;

export function ProfileDashboard({ profile, isOwnProfile }: ProfileDashboardProps) {
	const { user: currentUser } = useAuth();
	const { data: extendedStats, isLoading, error } = useProfileStats(profile.username);
	const [visibleWidgets, setVisibleWidgets] = useState<string[]>([]);
	const [userContext, setUserContext] = useState<'visitor' | 'friend' | 'self'>('visitor');

	useEffect(() => {
		// Determine user context for personalized experience
		if (isOwnProfile) {
			setUserContext('self');
		} else if (profile.relationships?.friends?.some((f) => f.id === currentUser?.id)) {
			setUserContext('friend');
		} else {
			setUserContext('visitor');
		}
	}, [isOwnProfile, profile.relationships, currentUser]);

	useEffect(() => {
		// Progressive widget reveal
		const widgets = getWidgetPriority(userContext, extendedStats);
		widgets.forEach((widget, index) => {
			setTimeout(
				() => {
					setVisibleWidgets((prev) => [...prev, widget]);
				},
				index * STAGGER_DELAY * 1000
			);
		});
	}, [userContext, extendedStats]);

	const widgetPriority = getWidgetPriority(userContext, extendedStats);

	if (isLoading) {
		return <ProfileDashboardSkeleton />;
	}

	return (
		<div className="space-y-6">
			<AnimatePresence mode="wait">
				{/* Primary Stats Row - Always visible */}
				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
					initial="hidden"
					animate="visible"
					variants={{
						visible: { transition: { staggerChildren: STAGGER_DELAY } }
					}}
				>
					{widgetPriority.slice(0, 3).map((widgetType, index) => (
						<motion.div
							key={widgetType}
							variants={WIDGET_VARIANTS}
							transition={{ duration: 0.5, delay: index * STAGGER_DELAY }}
						>
							{renderWidget(widgetType, profile, extendedStats, userContext)}
						</motion.div>
					))}
				</motion.div>

				{/* Secondary Stats Row */}
				{visibleWidgets.length > 3 && (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 gap-4"
						initial="hidden"
						animate="visible"
						variants={{
							visible: { transition: { staggerChildren: STAGGER_DELAY } }
						}}
					>
						{widgetPriority.slice(3, 5).map((widgetType, index) => (
							<motion.div
								key={widgetType}
								variants={WIDGET_VARIANTS}
								transition={{ duration: 0.5, delay: (index + 3) * STAGGER_DELAY }}
							>
								{renderWidget(widgetType, profile, extendedStats, userContext)}
							</motion.div>
						))}
					</motion.div>
				)}

				{/* Engagement Row */}
				{visibleWidgets.length > 5 && (
					<motion.div
						initial="hidden"
						animate="visible"
						variants={WIDGET_VARIANTS}
						transition={{ duration: 0.5, delay: 5 * STAGGER_DELAY }}
					>
						{renderWidget('milestones', profile, extendedStats, userContext)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function getWidgetPriority(
	userContext: 'visitor' | 'friend' | 'self',
	extendedStats: any
): string[] {
	const basePriority = ['reputation', 'activity', 'social'];

	switch (userContext) {
		case 'self':
			return ['reputation', 'wallet', 'activity', 'social', 'insights', 'milestones'];
		case 'friend':
			return ['reputation', 'activity', 'social', 'quick-actions', 'insights', 'milestones'];
		case 'visitor':
		default:
			return ['reputation', 'activity', 'social', 'quick-actions', 'insights', 'milestones'];
	}
}

function renderWidget(
	type: string,
	profile: ProfileData,
	extendedStats: any,
	userContext: 'visitor' | 'friend' | 'self'
) {
	if (!extendedStats) return null;

	switch (type) {
		case 'reputation':
			return (
				<ReputationCard
					clout={extendedStats.clout}
					reputation={extendedStats.reputation}
					dailyXpGained={extendedStats.dailyXpGained}
					lastXpGainDate={extendedStats.lastXpGainDate}
					level={extendedStats.level}
				/>
			);
		case 'activity':
			return (
				<ActivityStatsCard
					totalPosts={extendedStats.totalPosts}
					totalThreads={extendedStats.totalThreads}
					totalLikes={extendedStats.totalLikes}
					totalTips={extendedStats.totalTips}
					posterRank={extendedStats.posterRank}
					tipperRank={extendedStats.tipperRank}
					likerRank={extendedStats.likerRank}
					threadViewCount={extendedStats.threadViewCount}
				/>
			);
		case 'wallet':
			return (
				<WalletOverviewCard
					dgtBalance={extendedStats.dgtBalance}
					walletBalanceUSDT={extendedStats.walletBalanceUSDT}
					walletPendingWithdrawals={extendedStats.walletPendingWithdrawals}
					dgtPoints={extendedStats.dgtPoints}
				/>
			);
		case 'social':
			return (
				<SocialStatsCard
					followersCount={extendedStats.followersCount}
					followingCount={extendedStats.followingCount}
					friendsCount={extendedStats.friendsCount}
					friendRequestsSent={extendedStats.friendRequestsSent}
					friendRequestsReceived={extendedStats.friendRequestsReceived}
				/>
			);
		case 'quick-actions':
			return (
				<QuickActionsCard
					profileId={profile.id}
					username={profile.username}
					userContext={userContext}
					isOnline={extendedStats.lastSeenAt ? isRecentlyActive(extendedStats.lastSeenAt) : false}
				/>
			);
		case 'insights':
			return (
				<ProfileInsightsCard
					profile={profile}
					extendedStats={extendedStats}
					userContext={userContext}
				/>
			);
		case 'milestones':
			return (
				<MilestoneCard
					level={extendedStats.level}
					xp={extendedStats.xp}
					totalPosts={extendedStats.totalPosts}
					totalTips={extendedStats.totalTips}
					joinedAt={extendedStats.joinedAt}
					referralsCount={extendedStats.referralsCount}
				/>
			);
		default:
			return null;
	}
}

function isRecentlyActive(lastSeenAt: string): boolean {
	const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
	return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
}

function ProfileDashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-48 bg-zinc-800/50 animate-pulse rounded-lg border border-zinc-700/30"
					/>
				))}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{[1, 2].map((i) => (
					<div
						key={i}
						className="h-32 bg-zinc-800/50 animate-pulse rounded-lg border border-zinc-700/30"
					/>
				))}
			</div>
		</div>
	);
}
