import React from 'react';
import { BarChart2, ShoppingBag, Award } from 'lucide-react';
import { XPProgressBar } from '@/components/profile/XPProgressBar';
import StatCard from './StatCard';
import type { ProfileData } from '@/types/profile';

interface Props {
	profile: ProfileData;
}

const OverviewTab: React.FC<Props> = ({ profile }) => (
	<div className="space-y-6">
		<XPProgressBar
			level={profile.level}
			currentXP={profile.xp}
			nextLevelXP={profile.nextLevelXp}
			showProBadge={profile.level >= 10}
		/>

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

export default OverviewTab;
