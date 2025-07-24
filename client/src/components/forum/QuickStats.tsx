import React from 'react';
import { MessageSquare, Users, Eye, TrendingUp } from 'lucide-react';
import { FrostCard } from '@app/components/ui/frost-card';
import { CardContent, CardHeader, CardTitle } from '@app/components/ui/card';

interface QuickStatsProps {
	totalThreads?: number;
	totalPosts?: number;
	onlineUsers?: number;
	todaysActivity?: number;
	isLoading?: boolean;
}

export function QuickStats({
	totalThreads = 0,
	totalPosts = 0,
	onlineUsers = 0,
	todaysActivity = 0,
	isLoading = false
}: QuickStatsProps) {
	if (isLoading) {
		return (
			<FrostCard accentColor="emerald">
				<CardHeader className="pb-3">
					<CardTitle className="text-emerald-400 text-lg">Forum Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="flex items-center space-x-3">
								<div className="w-8 h-8 bg-zinc-700 rounded animate-pulse" />
								<div className="space-y-1">
									<div className="h-4 w-16 bg-zinc-700 rounded animate-pulse" />
									<div className="h-3 w-12 bg-zinc-800 rounded animate-pulse" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</FrostCard>
		);
	}

	const stats = [
		{
			label: 'Threads',
			value: totalThreads.toLocaleString(),
			icon: MessageSquare,
			color: 'text-emerald-400'
		},
		{
			label: 'Posts',
			value: totalPosts.toLocaleString(),
			icon: Eye,
			color: 'text-blue-400'
		},
		{
			label: 'Online',
			value: onlineUsers.toLocaleString(),
			icon: Users,
			color: 'text-green-400'
		},
		{
			label: 'Today',
			value: todaysActivity.toLocaleString(),
			icon: TrendingUp,
			color: 'text-amber-400'
		}
	];

	return (
		<FrostCard accentColor="emerald" className="hover:border-emerald-500/30">
			<CardHeader className="pb-3">
				<CardTitle className="text-emerald-400 text-lg">Forum Stats</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-4">
					{stats.map((stat) => (
						<div key={stat.label} className="flex items-center space-x-3">
							<div className={`p-2 rounded-lg bg-zinc-800/50 ${stat.color}`}>
								<stat.icon className="h-4 w-4" />
							</div>
							<div>
								<div className="font-semibold text-white">{stat.value}</div>
								<div className="text-xs text-zinc-400">{stat.label}</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</FrostCard>
	);
}
