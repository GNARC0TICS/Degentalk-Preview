import React from 'react';
import { Users, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

interface SocialStatsCardProps {
	followersCount: number;
	followingCount: number;
	friendsCount: number;
	friendRequestsSent: number;
	friendRequestsReceived: number;
	className?: string;
}

export function SocialStatsCard({
	followersCount,
	followingCount,
	friendsCount,
	friendRequestsSent,
	friendRequestsReceived,
	className
}: SocialStatsCardProps) {
	const needsMoreConnections = friendsCount < 3;
	const hasPendingRequests = friendRequestsReceived > 0;

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
					<Users className="h-4 w-4 text-blue-400" />
					Social Graph
				</h3>
				{hasPendingRequests && (
					<div className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium">
						{friendRequestsReceived} Pending
					</div>
				)}
			</div>

			<div className="grid grid-cols-3 gap-3">
				<SocialStatItem
					icon={<Users className="h-4 w-4 text-emerald-400" />}
					label="Friends"
					value={friendsCount}
				/>
				<SocialStatItem
					icon={<UserCheck className="h-4 w-4 text-blue-400" />}
					label="Followers"
					value={followersCount}
				/>
				<SocialStatItem
					icon={<UserPlus className="h-4 w-4 text-purple-400" />}
					label="Following"
					value={followingCount}
				/>
			</div>

			{needsMoreConnections && (
				<div className="p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
					<div className="flex items-center gap-2">
						<MessageCircle className="h-4 w-4 text-blue-400" />
						<span className="text-sm text-blue-300">
							Connect with more users to unlock features!
						</span>
					</div>
				</div>
			)}

			{friendRequestsSent > 0 && (
				<div className="flex items-center justify-between text-sm pt-2 border-t border-zinc-700/30">
					<span className="text-zinc-400">Requests Sent</span>
					<span className="text-amber-400 font-medium">{friendRequestsSent}</span>
				</div>
			)}
		</div>
	);
}

interface SocialStatItemProps {
	icon: React.ReactNode;
	label: string;
	value: number;
}

function SocialStatItem({ icon, label, value }: SocialStatItemProps) {
	const displayValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0;

	return (
		<div className="text-center space-y-2">
			<div className="flex justify-center">{icon}</div>
			<div className="space-y-1">
				<div className="text-lg font-bold text-zinc-100">{displayValue.toLocaleString()}</div>
				<div className="text-xs text-zinc-400">{label}</div>
			</div>
		</div>
	);
}
