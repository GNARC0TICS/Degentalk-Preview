import React from 'react';
import { Users, MessageSquare, Clock, TrendingUp } from 'lucide-react';

interface ForumStats {
	totalThreads: number;
	totalPosts: number;
	totalMembers: number;
	onlineUsers: number;
	newestMember?: string;
}

interface MyBBStatsProps {
	stats: ForumStats;
}

export function MyBBStats({ stats }: MyBBStatsProps) {
	return (
		<div className="mybb-whos-online mt-8">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-semibold text-sm flex items-center gap-2">
					<Users className="w-4 h-4" />
					Forum Statistics
				</h3>
			</div>
			
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
				<div>
					<div className="text-gray-600">Total Threads</div>
					<div className="font-semibold">{stats.totalThreads.toLocaleString()}</div>
				</div>
				<div>
					<div className="text-gray-600">Total Posts</div>
					<div className="font-semibold">{stats.totalPosts.toLocaleString()}</div>
				</div>
				<div>
					<div className="text-gray-600">Total Members</div>
					<div className="font-semibold">{stats.totalMembers.toLocaleString()}</div>
				</div>
				<div>
					<div className="text-gray-600">Users Online</div>
					<div className="font-semibold text-green-600">{stats.onlineUsers}</div>
				</div>
			</div>
			
			{stats.newestMember && (
				<div className="mt-3 text-sm text-gray-600">
					Welcome to our newest member, <span className="font-semibold text-blue-600">{stats.newestMember}</span>!
				</div>
			)}
		</div>
	);
}

export function MyBBLegend() {
	return (
		<div className="mybb-legend">
			<div className="font-semibold text-sm mb-2">Forum Legend</div>
			<div className="flex flex-wrap gap-4 text-xs">
				<div className="mybb-legend-item">
					<MessageSquare className="inline w-4 h-4 text-blue-500 mr-1" />
					New Posts
				</div>
				<div className="mybb-legend-item">
					<MessageSquare className="inline w-4 h-4 text-gray-400 mr-1" />
					No New Posts
				</div>
				<div className="mybb-legend-item">
					<TrendingUp className="inline w-4 h-4 text-red-500 mr-1" />
					Hot Topic
				</div>
				<div className="mybb-legend-item">
					<Clock className="inline w-4 h-4 text-amber-500 mr-1" />
					Recently Active
				</div>
			</div>
		</div>
	);
}