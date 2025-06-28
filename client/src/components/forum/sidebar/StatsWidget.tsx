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
		<div className="grid grid-cols-2 gap-4">
			{stats.map((stat) => (
				<div key={stat.label} className="space-y-1">
					<span className="block text-sm font-semibold text-zinc-100 leading-tight">
						{stat.value.toLocaleString()}
						{stat.delta && (
							<span
								className={cn(
									'ml-1 text-2xs font-medium px-1 py-0.5 rounded-full',
									stat.delta > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
								)}
							>
								{stat.delta > 0 ? '+' : ''}
								{stat.delta}%
							</span>
						)}
					</span>
					<span className="text-2xs uppercase tracking-wide text-zinc-500">{stat.label}</span>
				</div>
			))}
		</div>
	);

	return (
		<SidebarWidgetCard
			title="Forum Stonks"
			icon={TrendingUp}
			colorTheme={colorTheme}
			className={className}
			slots={{ body: bodyContent }}
		/>
	);
}
