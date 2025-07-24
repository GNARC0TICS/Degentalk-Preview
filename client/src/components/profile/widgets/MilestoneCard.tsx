import React from 'react';
import { Trophy, Calendar, Star, Zap } from 'lucide-react';
import { cn } from '@app/utils/utils';

interface Milestone {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	achieved: boolean;
	progress?: number;
	maxProgress?: number;
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface MilestoneCardProps {
	level: number;
	xp: number;
	totalPosts: number;
	totalTips: number;
	joinedAt: string;
	referralsCount?: number;
	className?: string;
}

export function MilestoneCard({
	level,
	xp,
	totalPosts,
	totalTips,
	joinedAt,
	referralsCount = 0,
	className
}: MilestoneCardProps) {
	const milestones = generateMilestones({
		level,
		xp,
		totalPosts,
		totalTips,
		joinedAt,
		referralsCount
	});

	const achievedCount = milestones.filter((m) => m.achieved).length;
	const completionPercentage = (achievedCount / milestones.length) * 100;

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
					<Trophy className="h-4 w-4 text-amber-400" />
					Milestones
				</h3>
				<div className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-medium">
					{achievedCount}/{milestones.length}
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="text-zinc-400">Completion</span>
					<span className="text-amber-400 font-medium">{completionPercentage.toFixed(0)}%</span>
				</div>
				<div className="w-full bg-zinc-700/50 rounded-full h-2">
					<div
						className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
						style={{ width: `${completionPercentage}%` }}
					/>
				</div>
			</div>

			<div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-600">
				{milestones.map((milestone) => (
					<MilestoneItem key={milestone.id} milestone={milestone} />
				))}
			</div>
		</div>
	);
}

interface MilestoneItemProps {
	milestone: Milestone;
}

function MilestoneItem({ milestone }: MilestoneItemProps) {
	const rarityColors = {
		common: 'border-zinc-600/30 text-zinc-400',
		rare: 'border-blue-500/30 text-blue-400',
		epic: 'border-purple-500/30 text-purple-400',
		legendary: 'border-amber-500/30 text-amber-400'
	};

	return (
		<div
			className={cn(
				'flex items-center gap-3 p-2 rounded-md border transition-all duration-200',
				milestone.achieved
					? `${rarityColors[milestone.rarity]} bg-gradient-to-r from-transparent to-zinc-700/20`
					: 'border-zinc-700/30 text-zinc-500 opacity-60'
			)}
		>
			<div
				className={cn(
					'flex-shrink-0 p-1 rounded',
					milestone.achieved ? 'bg-current/20' : 'bg-zinc-700/30'
				)}
			>
				{milestone.icon}
			</div>
			<div className="flex-1 min-w-0">
				<div className="font-medium text-sm truncate">{milestone.title}</div>
				<div className="text-xs opacity-80 truncate">{milestone.description}</div>
				{milestone.progress !== undefined && milestone.maxProgress && (
					<div className="mt-1 w-full bg-zinc-700/50 rounded-full h-1">
						<div
							className="bg-current h-1 rounded-full transition-all duration-500"
							style={{ width: `${(milestone.progress / milestone.maxProgress) * 100}%` }}
						/>
					</div>
				)}
			</div>
			{milestone.achieved && <Zap className="h-4 w-4 text-current flex-shrink-0" />}
		</div>
	);
}

function generateMilestones({
	level,
	xp,
	totalPosts,
	totalTips,
	joinedAt,
	referralsCount
}: {
	level: number;
	xp: number;
	totalPosts: number;
	totalTips: number;
	joinedAt: string;
	referralsCount: number;
}): Milestone[] {
	const joinDate = new Date(joinedAt);
	const daysSinceJoined = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
	const yearsSinceJoined = daysSinceJoined / 365;

	return [
		{
			id: 'first-post',
			title: 'First Steps',
			description: 'Made your first post',
			icon: <Star className="h-3 w-3" />,
			achieved: totalPosts >= 1,
			rarity: 'common'
		},
		{
			id: 'level-10',
			title: 'Rising Star',
			description: 'Reached level 10',
			icon: <Trophy className="h-3 w-3" />,
			achieved: level >= 10,
			progress: level,
			maxProgress: 10,
			rarity: 'common'
		},
		{
			id: 'hundred-posts',
			title: 'Active Member',
			description: 'Posted 100 times',
			icon: <Star className="h-3 w-3" />,
			achieved: totalPosts >= 100,
			progress: Math.min(totalPosts, 100),
			maxProgress: 100,
			rarity: 'rare'
		},
		{
			id: 'thousand-tips',
			title: 'Generous Soul',
			description: 'Gave $1,000 in tips',
			icon: <Trophy className="h-3 w-3" />,
			achieved: totalTips >= 1000,
			progress: Math.min(totalTips, 1000),
			maxProgress: 1000,
			rarity: 'epic'
		},
		{
			id: 'one-year',
			title: 'Veteran',
			description: '1 year member',
			icon: <Calendar className="h-3 w-3" />,
			achieved: yearsSinceJoined >= 1,
			rarity: 'rare'
		},
		{
			id: 'level-50',
			title: 'Elite Member',
			description: 'Reached level 50',
			icon: <Trophy className="h-3 w-3" />,
			achieved: level >= 50,
			progress: Math.min(level, 50),
			maxProgress: 50,
			rarity: 'epic'
		},
		{
			id: 'referral-master',
			title: 'Referral Master',
			description: 'Referred 10 users',
			icon: <Star className="h-3 w-3" />,
			achieved: referralsCount >= 10,
			progress: Math.min(referralsCount, 10),
			maxProgress: 10,
			rarity: 'legendary'
		}
	];
}
