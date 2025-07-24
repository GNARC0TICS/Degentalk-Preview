import React from 'react';
import { TrendingUp, Zap, Star, Target, AlertCircle, Crown, Gift } from 'lucide-react';
import { cn } from '@app/utils/utils';
import type { ProfileData } from '@app/types/profile';
import type { ExtendedProfileStats } from '@app/hooks/useProfileStats';

interface ProfileInsightsCardProps {
	profile: ProfileData;
	extendedStats: ExtendedProfileStats;
	userContext: 'visitor' | 'friend' | 'self';
	className?: string;
}

interface Insight {
	id: string;
	type: 'achievement' | 'opportunity' | 'warning' | 'milestone' | 'social';
	title: string;
	description: string;
	icon: React.ReactNode;
	priority: 'high' | 'medium' | 'low';
	actionText?: string;
	actionUrl?: string;
}

export function ProfileInsightsCard({
	profile,
	extendedStats,
	userContext,
	className
}: ProfileInsightsCardProps) {
	const insights = generateInsights(profile, extendedStats, userContext);
	const displayInsights = insights
		.sort((a, b) => {
			const priorityOrder = { high: 3, medium: 2, low: 1 };
			return priorityOrder[b.priority] - priorityOrder[a.priority];
		})
		.slice(0, 3); // Show top 3 insights

	if (displayInsights.length === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				'bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-sm',
				'border border-zinc-700/40 rounded-lg p-4 space-y-4',
				className
			)}
		>
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
					<Zap className="h-4 w-4 text-purple-400" />
					{userContext === 'self' ? 'Your Insights' : 'Profile Insights'}
				</h3>
				<div className="px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-medium">
					{displayInsights.length} Active
				</div>
			</div>

			<div className="space-y-3">
				{displayInsights.map((insight) => (
					<InsightItem key={insight.id} insight={insight} />
				))}
			</div>
		</div>
	);
}

interface InsightItemProps {
	insight: Insight;
}

function InsightItem({ insight }: InsightItemProps) {
	const typeColors = {
		achievement: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
		opportunity: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
		warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
		milestone: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
		social: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
	};

	return (
		<div
			className={cn(
				'flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:bg-zinc-700/20',
				typeColors[insight.type]
			)}
		>
			<div className="flex-shrink-0 p-1 rounded">{insight.icon}</div>
			<div className="flex-1 min-w-0">
				<div className="font-medium text-sm text-zinc-200 mb-1">{insight.title}</div>
				<div className="text-xs text-zinc-400 leading-relaxed">{insight.description}</div>
				{insight.actionText && (
					<div className="mt-2">
						<button className="text-xs font-medium text-current hover:underline">
							{insight.actionText} →
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

function generateInsights(
	profile: ProfileData,
	stats: ExtendedProfileStats,
	userContext: 'visitor' | 'friend' | 'self'
): Insight[] {
	const insights: Insight[] = [];
	const now = new Date();
	const joinedDate = new Date(stats.joinedAt);
	const daysSinceJoined = Math.floor(
		(now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	// Achievement insights
	if (stats.level >= 50) {
		insights.push({
			id: 'elite-level',
			type: 'achievement',
			title: 'Elite Member',
			description: `Reached level ${stats.level}! This puts them in the top 5% of all users.`,
			icon: <Crown className="h-4 w-4" />,
			priority: 'high'
		});
	}

	if (stats.posterRank && stats.posterRank <= 10) {
		insights.push({
			id: 'top-poster',
			type: 'achievement',
			title: 'Top Poster',
			description: `Ranked #${stats.posterRank} among all forum contributors. Exceptional activity!`,
			icon: <Star className="h-4 w-4" />,
			priority: 'high'
		});
	}

	// Opportunity insights for self
	if (userContext === 'self') {
		if (stats.friendsCount < 5) {
			insights.push({
				id: 'make-friends',
				type: 'opportunity',
				title: 'Expand Your Network',
				description:
					'Connect with more users to unlock exclusive features and boost your reputation.',
				icon: <Target className="h-4 w-4" />,
				priority: 'medium',
				actionText: 'Find Friends'
			});
		}

		if (stats.dailyXpGained === 0) {
			insights.push({
				id: 'daily-xp',
				type: 'opportunity',
				title: 'Earn Daily XP',
				description:
					'Post in forums or engage with content to maintain your XP streak and climb the leaderboards.',
				icon: <Zap className="h-4 w-4" />,
				priority: 'high',
				actionText: 'Start Posting'
			});
		}

		if (!stats.activeSubscription) {
			insights.push({
				id: 'upgrade-vip',
				type: 'opportunity',
				title: 'Unlock VIP Benefits',
				description:
					'Upgrade to VIP for exclusive features, 2x XP multiplier, and premium cosmetics.',
				icon: <Crown className="h-4 w-4" />,
				priority: 'medium',
				actionText: 'View Plans'
			});
		}
	}

	// Social insights for visitors
	if (userContext === 'visitor') {
		if (stats.reputation > 5000) {
			insights.push({
				id: 'trusted-member',
				type: 'social',
				title: 'Highly Trusted',
				description: `${stats.reputation.toLocaleString()} reputation points from community votes. Very reliable user.`,
				icon: <Star className="h-4 w-4" />,
				priority: 'high'
			});
		}

		if (stats.totalTips > 10000) {
			insights.push({
				id: 'generous-tipper',
				type: 'social',
				title: 'Generous Community Member',
				description: `Has given over $${stats.totalTips.toLocaleString()} in tips to other users. Known for supporting the community.`,
				icon: <Gift className="h-4 w-4" />,
				priority: 'medium'
			});
		}
	}

	// Milestone insights
	if (daysSinceJoined >= 365) {
		const years = Math.floor(daysSinceJoined / 365);
		insights.push({
			id: 'veteran',
			type: 'milestone',
			title: `${years} Year Veteran`,
			description: `Long-standing community member with ${daysSinceJoined} days of experience on the platform.`,
			icon: <TrendingUp className="h-4 w-4" />,
			priority: 'medium'
		});
	}

	// Warning insights
	if (stats.lastSeenAt) {
		const lastSeen = new Date(stats.lastSeenAt);
		const daysSinceLastSeen = Math.floor(
			(now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (daysSinceLastSeen > 30 && userContext === 'self') {
			insights.push({
				id: 'inactive-warning',
				type: 'warning',
				title: 'Long Time Away',
				description: `You haven't been active for ${daysSinceLastSeen} days. Check out what's new in the community!`,
				icon: <AlertCircle className="h-4 w-4" />,
				priority: 'high',
				actionText: 'Catch Up'
			});
		}
	}

	// Path XP insights
	if (stats.pathXp && Object.keys(stats.pathXp).length > 0) {
		const topPath = Object.entries(stats.pathXp).sort(([, a], [, b]) => b - a)[0];

		if (topPath && topPath[1] > 1000) {
			insights.push({
				id: 'path-specialist',
				type: 'achievement',
				title: `${topPath[0]} Specialist`,
				description: `${topPath[1].toLocaleString()} XP in ${topPath[0]} path. Clear area of expertise!`,
				icon: <Target className="h-4 w-4" />,
				priority: 'medium'
			});
		}
	}

	return insights;
}
