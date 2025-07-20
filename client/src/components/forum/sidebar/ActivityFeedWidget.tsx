import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight, Clock } from 'lucide-react';
import { SidebarWidgetCard } from './SidebarWidgetCard';
import { WidgetSkeleton } from './WidgetSkeleton';
import { useActivityFeed } from '@/features/activity/hooks/useActivityFeed';
import { formatDistanceToNow } from 'date-fns';
import type { EventLog } from '@/features/activity/services/activityApi';
import { type StructureId } from '@shared/types/ids';

interface ActivityFeedWidgetProps {
	structureId?: StructureId;
	limit?: number;
	colorTheme?: string;
	className?: string;
}

const ActivityItem: React.FC<{ event: EventLog; isCompact?: boolean }> = ({
	event,
	isCompact = true
}) => {
	const renderEventContent = () => {
		switch (event.eventType) {
			case 'thread_created':
				return (
					<div className="flex flex-col">
						<span className="text-sm text-zinc-200">Created thread</span>
						<span className="text-xs text-zinc-500 line-clamp-1">
							{(event.meta as any)?.threadTitle || 'New thread'}
						</span>
					</div>
				);

			case 'post_created':
				return (
					<div className="flex flex-col">
						<span className="text-sm text-zinc-200">Posted reply</span>
						<span className="text-xs text-zinc-500 line-clamp-1">
							{(event.meta as any)?.threadTitle ? `in ${(event.meta as any)?.threadTitle}` : ''}
						</span>
					</div>
				);

			case 'level_up':
				return (
					<div className="flex flex-col">
						<span className="text-sm text-zinc-200">Leveled up!</span>
						<span className="text-xs text-zinc-500">
							Level {(event.meta as any)?.oldLevel} → {(event.meta as any)?.newLevel}
						</span>
					</div>
				);

			case 'badge_earned':
				return (
					<div className="flex flex-col">
						<span className="text-sm text-zinc-200">Earned badge</span>
						<span className="text-xs text-zinc-500">{(event.meta as any)?.badgeName}</span>
					</div>
				);

			default:
				return <span className="text-sm text-zinc-200">{event.eventType.replace('_', ' ')}</span>;
		}
	};

	return (
		<div className="flex items-start justify-between gap-3 py-2">
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span className="text-sm font-medium text-zinc-300">{event.username}</span>
				</div>
				{renderEventContent()}
			</div>
			<time
				className="text-xs text-zinc-500 flex-shrink-0 flex items-center"
				dateTime={event.createdAt}
			>
				<Clock className="h-3 w-3 mr-1" />
				{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
			</time>
		</div>
	);
};

export function ActivityFeedWidget({
	structureId,
	limit = 5,
	colorTheme,
	className
}: ActivityFeedWidgetProps) {
	const { activityFeed, isLoading } = useActivityFeed({
		limit,
		structureId
	});

	const events = activityFeed || [];

	const bodyContent = isLoading ? (
		<WidgetSkeleton rows={limit} />
	) : events.length === 0 ? (
		<div className="text-center py-4 text-zinc-400">
			<Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
			<p className="text-sm">No recent activity</p>
		</div>
	) : (
		<div className="space-y-1 divide-y divide-zinc-800/30">
			{events.slice(0, limit).map((event) => (
				<ActivityItem key={event.id} event={event} isCompact />
			))}
		</div>
	);

	const footerContent = (
		<Link
			href="/activity"
			className="flex items-center justify-between text-sm text-zinc-400 hover:text-emerald-400 transition-colors group"
		>
			<span>See full feed</span>
			<ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
		</Link>
	);

	return (
		<SidebarWidgetCard
			title="Recent Activity"
			icon={Activity}
			colorTheme={colorTheme}
			className={className}
			slots={{
				body: bodyContent,
				footer: footerContent
			}}
		/>
	);
}
