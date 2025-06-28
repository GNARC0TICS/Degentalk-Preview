import React from 'react';
import { MessageSquare, Users, Eye, TrendingUp, type LucideIcon } from 'lucide-react';
import { SidebarWidgetCard } from './SidebarWidgetCard';
import { WidgetSkeleton } from './WidgetSkeleton';
import { useForumMetrics } from '@/features/forum/hooks/useForumStats';
import { cn } from '@/lib/utils';

interface Stat {
	label: string;
	value: number;
	icon: LucideIcon;
	delta?: number;
}

interface StatsWidgetProps {
	structureId?: number;
	colorTheme?: string;
	className?: string;
}

export function StatsWidget({ structureId, colorTheme, className }: StatsWidgetProps) {
	const { data: metrics, isLoading } = useForumMetrics(structureId);

	const stats: Stat[] = [
		{
			label: 'Threads',
			value: metrics?.totalThreads || 0,
			icon: MessageSquare
		},
		{
			label: 'Posts',
			value: metrics?.totalPosts || 0,
			icon: Eye
		},
		{
			label: 'Online',
			value: metrics?.onlineUsers || 0,
			icon: Users,
			delta: 12 // Example: +12% from yesterday
		},
		{
			label: 'Today',
			value: metrics?.todaysActivity || 0,
			icon: TrendingUp,
			delta: -5 // Example: -5% from yesterday
		}
	];

	const bodyContent = isLoading ? (
		<WidgetSkeleton rows={4} />
	) : (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{stats.map((stat) => (
				<div key={stat.label} className="flex items-center space-x-3">
					<div className="p-2 rounded-lg bg-zinc-800/50">
						<stat.icon className="h-4 w-4 text-zinc-400" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-zinc-100">{stat.value.toLocaleString()}</span>
							{stat.delta && (
								<span
									className={cn(
										'text-xs font-medium px-1.5 py-0.5 rounded-full',
										stat.delta > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
									)}
								>
									{stat.delta > 0 ? '+' : ''}
									{stat.delta}%
								</span>
							)}
						</div>
						<div className="text-xs text-zinc-500">{stat.label}</div>
					</div>
				</div>
			))}
		</div>
	);

	return (
		<SidebarWidgetCard
			title="Forum Stats"
			icon={TrendingUp}
			colorTheme={colorTheme}
			className={className}
			slots={{ body: bodyContent }}
		/>
	);
}
