import React from 'react';
import { MessageSquare, Hash, Heart, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityStatsCardProps {
	totalPosts: number;
	totalThreads: number;
	totalLikes: number;
	totalTips: number;
	posterRank?: number | null;
	tipperRank?: number | null;
	likerRank?: number | null;
	threadViewCount: number;
	className?: string;
}

export function ActivityStatsCard({
	totalPosts,
	totalThreads,
	totalLikes,
	totalTips,
	posterRank,
	tipperRank,
	likerRank,
	threadViewCount,
	className
}: ActivityStatsCardProps) {
	const hasRankings = posterRank || tipperRank || likerRank;
	const topRank = Math.min(...([posterRank, tipperRank, likerRank].filter(Boolean) as string[]));

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
					<TrendingUp className="h-4 w-4 text-blue-400" />
					Activity Stats
				</h3>
				{hasRankings && topRank <= 100 && (
					<div className="px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-medium">
						Top {topRank}%
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<StatItem
					icon={<MessageSquare className="h-4 w-4 text-emerald-400" />}
					label="Posts"
					value={totalPosts}
					rank={posterRank}
				/>
				<StatItem
					icon={<Hash className="h-4 w-4 text-blue-400" />}
					label="Threads"
					value={totalThreads}
				/>
				<StatItem
					icon={<Heart className="h-4 w-4 text-pink-400" />}
					label="Likes"
					value={totalLikes}
					rank={likerRank}
				/>
				<StatItem
					icon={<DollarSign className="h-4 w-4 text-amber-400" />}
					label="Tips"
					value={totalTips}
					rank={tipperRank}
					isCurrency
				/>
			</div>

			{threadViewCount > 0 && (
				<div className="pt-2 border-t border-zinc-700/30">
					<div className="flex items-center justify-between text-sm">
						<span className="text-zinc-400">Total Views</span>
						<span className="text-zinc-200 font-medium">{threadViewCount.toLocaleString()}</span>
					</div>
				</div>
			)}
		</div>
	);
}

interface StatItemProps {
	icon: React.ReactNode;
	label: string;
	value: number;
	rank?: number | null;
	isCurrency?: boolean;
}

function StatItem({ icon, label, value, rank, isCurrency }: StatItemProps) {
	const isDefined = typeof value === 'number' && !Number.isNaN(value);
	const displayValue = isDefined ? value : 0;

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				{icon}
				<span className="text-xs text-zinc-400">{label}</span>
			</div>
			<div className="space-y-1">
				<div className="text-lg font-bold text-zinc-100">
					{isCurrency ? `$${displayValue.toLocaleString()}` : displayValue.toLocaleString()}
				</div>
				{rank != null && rank <= 1000 && (
					<div className="text-xs text-amber-400">#{rank} ranked</div>
				)}
			</div>
		</div>
	);
}
