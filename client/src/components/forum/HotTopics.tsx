import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, MessageSquare, Clock } from 'lucide-react';
import { FrostCard } from '@/components/ui/frost-card';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ThreadId } from '@shared/types/ids';

interface HotThread {
	id: ThreadId;
	title: string;
	slug: string;
	replies: number;
	views: number;
	lastActivity: string;
	forumName: string;
	forumSlug: string;
	isHot?: boolean;
	isPinned?: boolean;
}

interface HotTopicsProps {
	threads?: HotThread[];
	isLoading?: boolean;
	limit?: number;
}

export function HotTopics({ threads = [], isLoading = false, limit = 5 }: HotTopicsProps) {
	if (isLoading) {
		return (
			<FrostCard accentColor="orange">
				<CardHeader className="pb-3">
					<CardTitle className="text-orange-400 text-lg flex items-center">
						<Flame className="h-5 w-5 mr-2" />
						Hot Topics
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{[...Array(limit)].map((_, i) => (
						<div key={i} className="space-y-2 pb-3 border-b border-zinc-800/50 last:border-b-0">
							<div className="h-4 w-full bg-zinc-700 rounded animate-pulse" />
							<div className="flex justify-between items-center">
								<div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
								<div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
							</div>
						</div>
					))}
				</CardContent>
			</FrostCard>
		);
	}

	const displayThreads = threads.slice(0, limit);

	return (
		<FrostCard accentColor="orange" className="hover:border-orange-500/30">
			<CardHeader className="pb-3">
				<CardTitle className="text-orange-400 text-lg flex items-center">
					<Flame className="h-5 w-5 mr-2" />
					Hot Topics
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{displayThreads.length === 0 ? (
					<div className="text-center py-4 text-zinc-400">
						<MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No hot topics yet</p>
					</div>
				) : (
					displayThreads.map((thread, index) => (
						<div
							key={thread.id}
							className="group space-y-2 pb-3 border-b border-zinc-800/50 last:border-b-0 hover:bg-zinc-800/30 -mx-3 px-3 py-2 rounded transition-colors"
						>
							<div className="flex items-start space-x-2">
								{index < 3 && (
									<div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
										{index + 1}
									</div>
								)}
								<div className="flex-grow min-w-0">
									<Link
										to={`/threads/${thread.slug}`}
										className="block hover:text-emerald-400 transition-colors"
									>
										<h4 className="font-medium text-white text-sm leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
											{thread.title}
										</h4>
									</Link>
									<div className="flex items-center space-x-3 mt-1">
										<Link
											to={`/forums/${thread.forumSlug}`}
											className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
										>
											{thread.forumName}
										</Link>
										{thread.isHot && (
											<Badge variant="destructive" className="text-xs">
												🔥 Hot
											</Badge>
										)}
										{thread.isPinned && (
											<Badge variant="outline" className="text-xs">
												📌 Pinned
											</Badge>
										)}
									</div>
								</div>
							</div>
							<div className="flex justify-between items-center text-xs text-zinc-400 ml-8">
								<div className="flex items-center space-x-3">
									<span className="flex items-center">
										<MessageSquare className="h-3 w-3 mr-1" />
										{thread.replies}
									</span>
									<span>{thread.views} views</span>
								</div>
								<div className="flex items-center">
									<Clock className="h-3 w-3 mr-1" />
									{thread.lastActivity}
								</div>
							</div>
						</div>
					))
				)}
			</CardContent>
		</FrostCard>
	);
}
