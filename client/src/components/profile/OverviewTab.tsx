import React from 'react';
import { BarChart2, ShoppingBag, Award } from 'lucide-react';
import { XPProgressBar } from '@app/components/profile/XPProgressBar';
import StatCard from './StatCard';
import { ReputationCard } from './widgets/ReputationCard';
import { ActivityStatsCard } from './widgets/ActivityStatsCard';
import { WalletOverviewCard } from './widgets/WalletOverviewCard';
import { SocialStatsCard } from './widgets/SocialStatsCard';
import { MilestoneCard } from './widgets/MilestoneCard';
import { useProfileStatsAvailable } from '@app/hooks/useProfileStats';
import type { ProfileData } from '@app/types/profile';

interface Props {
	profile: ProfileData;
}

const OverviewTab: React.FC<Props> = ({ profile }) => {
	const { hasExtendedStats, extendedStats } = useProfileStatsAvailable(profile.username);

	return (
		<div className="space-y-6">
			<XPProgressBar
				level={profile.level}
				currentXP={profile.xp}
				nextLevelXP={profile.nextLevelXp}
				showProBadge={profile.level >= 10}
			/>

			{hasExtendedStats && extendedStats ? (
				<>
					{/* Enhanced Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<ReputationCard
							reputation={extendedStats.reputation}
							reputation={extendedStats.reputation}
							dailyXpGained={extendedStats.dailyXpGained}
							lastXpGainDate={extendedStats.lastXpGainDate}
							level={extendedStats.level}
						/>
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
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<WalletOverviewCard
							dgtBalance={extendedStats.dgtBalance}
							walletBalanceUSDT={extendedStats.walletBalanceUSDT}
							walletPendingWithdrawals={extendedStats.walletPendingWithdrawals}
							dgtPoints={extendedStats.dgtPoints}
						/>
						<SocialStatsCard
							followersCount={extendedStats.followersCount}
							followingCount={extendedStats.followingCount}
							friendsCount={extendedStats.friendsCount}
							friendRequestsSent={extendedStats.friendRequestsSent}
							friendRequestsReceived={extendedStats.friendRequestsReceived}
						/>
					</div>

					<MilestoneCard
						level={extendedStats.level}
						xp={extendedStats.xp}
						totalPosts={extendedStats.totalPosts}
						totalTips={extendedStats.totalTips}
						joinedAt={extendedStats.joinedAt}
						referralsCount={extendedStats.referralsCount}
					/>
				</>
			) : (
				// Fallback to legacy stats display
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<StatCard
						label="Total Views"
						value={profile.stats.threadViewCount}
						icon={<BarChart2 className="h-5 w-5 text-zinc-400" />}
					/>
					<StatCard
						label="Tips Received"
						value={profile.totalTips}
						icon={<ShoppingBag className="h-5 w-5 text-amber-400" />}
						isCurrency
					/>
					<StatCard
						label="Poster Rank"
						value={profile.stats.posterRank || 0}
						icon={<Award className="h-5 w-5 text-emerald-400" />}
						isRank
					/>
					<StatCard
						label="Tipper Rank"
						value={profile.stats.tipperRank || 0}
						icon={<Award className="h-5 w-5 text-zinc-400" />}
						isRank
					/>
				</div>
			)}

			{profile.signature && (
				<div className="bg-zinc-900/70 backdrop-blur-sm p-4 rounded-lg border border-zinc-700/30">
					<h3 className="text-sm text-zinc-300 mb-2">Signature</h3>
					<div className="text-zinc-200 text-sm border-l-2 border-violet-500/50 pl-3 py-1">
						{profile.signature}
					</div>
				</div>
			)}

			<div className="bg-zinc-900/70 backdrop-blur-sm p-4 rounded-lg border border-zinc-700/30">
				<h3 className="text-md font-semibold text-zinc-200 mb-4">Recent Activity</h3>
				<div className="text-zinc-500 italic">Recent activity will be shown here</div>
			</div>
		</div>
	);
};

export default OverviewTab;
