import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare, UserPlus, Award } from 'lucide-react';
import { FrostCard } from '@app/components/ui/frost-card';
import { CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import type { EntityId } from '@shared/types/ids';

interface ActivityItem {
	id: EntityId;
	type: 'thread' | 'post' | 'user_join' | 'achievement';
	title: string;
	user: {
		id: EntityId;
		username: string;
		avatar?: string;
		level?: number;
	};
	timestamp: string;
	forumName?: string;
	forumSlug?: string;
	threadSlug?: string;
	icon?: React.ReactNode;
}

interface RecentActivityProps {
	activities?: ActivityItem[];
	isLoading?: boolean;
	limit?: number;
}

export function RecentActivity({
	activities = [],
	isLoading = false,
	limit = 10
}: RecentActivityProps) {
	if (isLoading) {
		return (
			<FrostCard accentColor="cyan">
				<CardHeader className="pb-3">
					<CardTitle className="text-cyan-400 text-lg flex items-center">
						<Clock className="h-5 w-5 mr-2" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{[...Array(limit)].map((_, i) => (
						<div key={i} className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-zinc-700 rounded-full animate-pulse" />
							<div className="flex-grow space-y-1">
								<div className="h-4 w-full bg-zinc-700 rounded animate-pulse" />
								<div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
							</div>
						</div>
					))}
				</CardContent>
			</FrostCard>
		);
	}

	const displayActivities = activities.slice(0, limit);

	const getActivityIcon = (type: ActivityItem['type']) => {
		switch (type) {
			case 'thread':
				return <MessageSquare className="h-4 w-4 text-emerald-400" />;
			case 'post':
				return <MessageSquare className="h-4 w-4 text-blue-400" />;
			case 'user_join':
				return <UserPlus className="h-4 w-4 text-green-400" />;
			case 'achievement':
				return <Award className="h-4 w-4 text-amber-400" />;
			default:
				return <Clock className="h-4 w-4 text-zinc-400" />;
		}
	};

	const getActivityText = (activity: ActivityItem) => {
		switch (activity.type) {
			case 'thread':
				return (
					<span>
						created thread{' '}
						<Link
							to={`/threads/${activity.threadSlug}`}
							className="text-emerald-400 hover:underline"
						>
							{activity.title}
						</Link>
						{activity.forumName && (
							<span>
								{' '}
								in{' '}
								<Link
									to={`/forums/${activity.forumSlug}`}
									className="text-cyan-400 hover:underline"
								>
									{activity.forumName}
								</Link>
							</span>
						)}
					</span>
				);
			case 'post':
				return (
					<span>
						replied to{' '}
						<Link
							to={`/threads/${activity.threadSlug}`}
							className="text-emerald-400 hover:underline"
						>
							{activity.title}
						</Link>
					</span>
				);
			case 'user_join':
				return <span>joined the community</span>;
			case 'achievement':
				return <span>earned achievement: {activity.title}</span>;
			default:
				return <span>{activity.title}</span>;
		}
	};

	return (
		<FrostCard accentColor="cyan" className="hover:border-cyan-500/30">
			<CardHeader className="pb-3">
				<CardTitle className="text-cyan-400 text-lg flex items-center">
					<Clock className="h-5 w-5 mr-2" />
					Recent Activity
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{displayActivities.length === 0 ? (
					<div className="text-center py-4 text-zinc-400">
						<Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No recent activity</p>
					</div>
				) : (
					displayActivities.map((activity) => (
						<div
							key={activity.id}
							className="flex items-start space-x-3 hover:bg-zinc-800/30 -mx-3 px-3 py-2 rounded transition-colors"
						>
							<Avatar className="h-8 w-8 flex-shrink-0">
								<AvatarImage src={activity.user.avatar} alt={activity.user.username} />
								<AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
									{activity.user.username.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-grow min-w-0">
								<div className="flex items-center space-x-2 mb-1">
									{getActivityIcon(activity.type)}
									<Link
										to={`/profile/${activity.user.username}`}
										className="font-medium text-white hover:text-emerald-400 transition-colors text-sm"
									>
										{activity.user.username}
									</Link>
									{activity.user.level && (
										<span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
											Lv.{activity.user.level}
										</span>
									)}
								</div>
								<div className="text-sm text-zinc-300 leading-snug">
									{getActivityText(activity)}
								</div>
								<div className="text-xs text-zinc-500 mt-1">{activity.timestamp}</div>
							</div>
						</div>
					))
				)}
			</CardContent>
		</FrostCard>
	);
}
