import React from 'react';
import { Eye, MessageSquare, Users } from 'lucide-react';

interface ZoneStatsProps {
	forumCount?: number;
	threadCount?: number;
	activeUsersCount?: number;
	className?: string;
}

export function ZoneStats({
	forumCount = 0,
	threadCount = 0,
	activeUsersCount = 0,
	className = ''
}: ZoneStatsProps) {
	return (
		<div className={`flex flex-wrap gap-4 text-xs text-zinc-300 font-semibold ${className}`}>
			<div className="flex items-center bg-black/30 rounded-full px-2.5 py-1.5">
				<MessageSquare className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
				<span>{forumCount} forums</span>
			</div>

			<div className="flex items-center bg-black/30 rounded-full px-2.5 py-1.5">
				<Eye className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
				<span>{threadCount} threads</span>
			</div>

			{activeUsersCount > 0 && (
				<div className="flex items-center bg-black/30 rounded-full px-2.5 py-1.5">
					<Users className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
					<span>{activeUsersCount} active</span>
				</div>
			)}
		</div>
	);
}

export default ZoneStats;
