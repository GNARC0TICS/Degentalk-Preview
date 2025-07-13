import React from 'react';
import { Link } from 'wouter';
import { Flame, MessageSquare, Eye, ChevronRight } from 'lucide-react';
import { SidebarWidgetCard } from './SidebarWidgetCard';
import { WidgetSkeleton } from './WidgetSkeleton';
import { useHotThreads } from '@/features/forum/hooks/useForumStats';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { type StructureId } from '@shared/types/ids';

interface HotTopicsWidgetProps {
	structureId?: StructureId;
	limit?: number;
	colorTheme?: string;
	className?: string;
}

const getRankEmoji = (index: number): string => {
	const rankEmojis = ['①', '②', '③', '④', '⑤'];
	return rankEmojis[index] || `${index + 1}`;
};

export function HotTopicsWidget({
	structureId,
	limit = 5,
	colorTheme,
	className
}: HotTopicsWidgetProps) {
	const { data: threads = [], isLoading } = useHotThreads({
		limit,
		structureId
	});

	const bodyContent = isLoading ? (
		<WidgetSkeleton rows={limit} />
	) : threads.length === 0 ? (
		<div className="text-center py-4 text-zinc-400">
			<MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
			<p className="text-sm">No hot topics yet</p>
		</div>
	) : (
		<div className="space-y-3">
			{threads.map((thread, index) => (
				<div
					key={thread.id}
					className="group space-y-2 pb-3 border-b border-zinc-800/30 last:border-b-0 hover:bg-zinc-800/20 -mx-4 px-4 py-2 rounded transition-colors"
				>
					<div className="flex items-start space-x-3">
						{/* Rank medal */}
						<div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
							{getRankEmoji(index)}
						</div>

						{/* Thread content */}
						<div className="flex-1 min-w-0">
							<Link href={`/threads/${thread.slug}`}>
								<h4 className="font-medium text-zinc-100 text-sm leading-snug group-hover:text-emerald-400 transition-colors line-clamp-1">
									{thread.title}
								</h4>
							</Link>

							{/* Thread meta */}
							<div className="flex items-center justify-between mt-1">
								<Link
									href={`/forums/${thread.forumSlug}`}
									className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
								>
									{thread.forumName}
								</Link>

								{/* Reply/view count pill */}
								<div className="flex items-center space-x-2 text-xs text-zinc-500">
									<span className="flex items-center bg-zinc-800/50 px-2 py-1 rounded-full">
										<MessageSquare className="h-3 w-3 mr-1" />
										{thread.replyCount}
									</span>
									<span className="flex items-center">
										<Eye className="h-3 w-3 mr-1" />
										{thread.viewCount > 1000
											? `${(thread.viewCount / 1000).toFixed(1)}k`
											: thread.viewCount}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);

	const footerContent = (
		<Link
			href="/forums/trending"
			className="flex items-center justify-between text-sm text-zinc-400 hover:text-emerald-400 transition-colors group"
		>
			<span>View all trending</span>
			<ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
		</Link>
	);

	return (
		<SidebarWidgetCard
			title="Hot Topics"
			icon={Flame}
			colorTheme={colorTheme}
			className={className}
			slots={{
				body: bodyContent,
				footer: footerContent
			}}
		/>
	);
}
